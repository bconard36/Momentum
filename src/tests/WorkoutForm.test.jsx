import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import WorkoutForm from '../components/WorkoutForm';
import { supabase } from '../utils/supabaseClient';


// Create spy/test objects for the chained methods 

const { mockFetchWorkoutLog, mockSelect, mockFrom, mockMatch, mockRpc, mockGetUser } = vi.hoisted(() => ({
    mockFetchWorkoutLog: vi.fn(),
    mockSelect: vi.fn(),
    mockFrom: vi.fn(),
    mockMatch: vi.fn(),
    mockRpc: vi.fn(),
    mockGetUser: vi.fn(),
}));

/**
 * Mock the entire supabase module for WorkoutForm
 * Supabase executes SELECT/FROM, rpc, and getUser()
*/
vi.mock('../utils/supabaseClient', () => ({
    supabase: {
        from: mockFrom,
        rpc: mockRpc,
        auth: {
            getUser: mockGetUser
        }
    }
}));

// WorkoutForm renders a <Link> — router context to avoid errors 
const renderWorkoutForm = () => {
    render(
        <MemoryRouter>
            <WorkoutForm 
                fetchWorkoutLog={mockFetchWorkoutLog}
            />
        </MemoryRouter>
    );
};

// beforeEach to reset the mock call 
beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
        data: {
            user: {
                id: "test-user-id"
            }
        }
    });

    mockFrom.mockReturnValue({
        select: mockSelect
    });

    mockSelect.mockReturnValue({
        match: mockMatch
    });

    mockMatch.mockResolvedValue({
        data: [],
        error: null,
    })

    mockRpc.mockResolvedValue({
        data: null,
        error: null
    });
});

describe("WorkoutForm", () => {

        // Test 1 - Empty State WorkoutForm renders
        it("renders empty state workout form", () => {
            renderWorkoutForm();

            expect(screen.getByRole("button", { name: /Build New Workout/i })).toBeInTheDocument();   
            expect(screen.getByRole("link", { name: /View Workout Log/i })).toBeInTheDocument();
        });

        // Test 2 - Renders Workout Date and Type after clicking Build New Workout  
        it("renders empty state workout form with only workout date and type", async () => {
            const user = userEvent.setup();
            renderWorkoutForm();

            // Form fields do not render until Build New Workout button is clicked 
            await user.click(screen.getByRole("button", { name: /Build New Workout/i }));

            expect(screen.getByLabelText(/Workout Date/i)).toBeInTheDocument();
            expect(screen.getByText(/Workout Type/i )).toBeInTheDocument();
            expect(screen.getByRole("radio", { name: /Duration/i })).toBeInTheDocument();
            expect(screen.getByRole("radio", { name: /Repetition/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Add Another Exercise/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Clear Exercise/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Save Workout/i })).toBeInTheDocument();
        });

        // Test 3 - Renders complete duration type-based workouts form with all necessary fields 
        it("renders complete duration type-based workout form with necessary fields", async () => {
            const user = userEvent.setup();
            renderWorkoutForm();

            // Form fields do not render until Build New Workout button is clicked 
            await user.click(screen.getByRole("button", { name: /Build New Workout/i }));

            // Metric fields do not render until type has been selected 
            await user.click(screen.getByRole("radio", { name: /Duration/i }));

            expect(screen.getByLabelText(/Exercise Name/i)).toBeInTheDocument();
            expect(screen.getByText(/Duration \(minutes\)/i)).toBeInTheDocument();
            expect(screen.getByText(/Duration \(seconds\)/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Add Another Exercise/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Clear Exercise/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Save Workout/i })).toBeInTheDocument();
        });

        // Test 4 - Renders complete repetition type-based workouts form with all necessary fields
        it("renders complete repetition type-based workout form with necessary fields", async () => {
            const user = userEvent.setup();
            renderWorkoutForm();

            // Form fields do not render until Build New Workout button is clicked 
            await user.click(screen.getByRole("button", { name: /Build New Workout/i }));

            // Metric fields do not render until type has been selected 
            await user.click(screen.getByRole("radio", { name: /Repetition/i }));

            expect(screen.getByLabelText(/Exercise Name/i)).toBeInTheDocument();
            expect(screen.getByText(/Weight \(lbs\)/i)).toBeInTheDocument();
            expect(screen.getByText(/Sets/i)).toBeInTheDocument();
            expect(screen.getByText(/Reps/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Add Another Exercise/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Clear Exercise/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Save Workout/i })).toBeInTheDocument();
        });

        // Test 5 - Client-side validation should block submission before Supabase is contacted 
        it("shows an error when workout form has empty inputs", async () => {
            const user = userEvent.setup();
            renderWorkoutForm();

            // Form fields do not render until Build New Workout button is clicked 
            await user.click(screen.getByRole("button", { name: /Build New Workout/i }));

            // Metric fields do not render until type has been selected 
            await user.click(screen.getByRole("radio", { name: /Repetition/i }));

            // Capture incomplete/invalid metric fields 
            await user.type(screen.getByLabelText(/exercise name/i), "Bench Press");
            await user.type(screen.getByLabelText(/Weight \(lbs\)/i), '-10');
            await user.type(screen.getByLabelText(/sets/i), '500');
            await user.type(screen.getByLabelText(/Reps/i), "''");

            // Mock the save workout 
            await user.click(screen.getByRole("button", { name: /Save Workout/i }));

            // findBy waits for the error to appear
            expect(mockRpc).not.toHaveBeenCalled();
            expect(await screen.findByText(/weight cannot be negative./i)).toBeInTheDocument();
            expect(await screen.findByText(/set count cannot exceed 100./i)).toBeInTheDocument();
            expect(await screen.findByText(/rep count is required./i)).toBeInTheDocument();
        });

        // Test 6 - valid form data should reach supabase with the correct shape 
        it("calls supabase.rpc() with correct workout data on valid submission", async () => {
            const user = userEvent.setup();
            renderWorkoutForm();

            // Form fields do not render until Build New Workout button is clicked 
            await user.click(screen.getByRole("button", { name: /Build New Workout/i }));

            await user.type(screen.getByLabelText(/Workout Date/i), "2026-08-24");

            // Metric fields do not render until type has been selected 
            await user.click(screen.getByRole("radio", { name: /Duration/i }));

            // Capture incomplete/invalid metric fields 
            await user.type(screen.getByLabelText(/exercise name/i), "Outdoor run");
            await user.type(screen.getByLabelText(/Duration \(minutes\)/i), '30');
            await user.type(screen.getByLabelText(/Duration \(seconds\)/i), '47');

            // Mock the save workout 
            await user.click(screen.getByRole("button", { name: /Save Workout/i }));

            // Store the 'payload' - form data 
            const mockPayload = {
                workout_entry: {
                    workout_id: expect.stringMatching(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                    ),
                    date: "2026-08-24",
                },
                resolved_exercises: [{
                    exercise_id: expect.stringMatching(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                    ),
                    type: 'duration',
                    name: 'outdoor run'
                }],
                workout_exercise_list: [{
                    workout_id: expect.stringMatching(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                    ),
                    exercise_id: expect.stringMatching(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                    ),
                    weight: undefined,
                    sets: undefined,
                    reps: undefined,
                    duration_minutes: 30,
                    duration_seconds: 47
                }]
            };

            await waitFor(() => {
                expect(mockRpc).toHaveBeenCalledWith(
                    "save_workout",
                    mockPayload
                );
            });
        });
});