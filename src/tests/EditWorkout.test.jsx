import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import EditWorkout from '../components/EditWorkout';

// Create a test workout object to be used in the test
const testWorkout= {
    workout_id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    ),
    date: "2026-08-24",
    exercises: [
        {
            exercise_id: '2fb945d6-cbae-4261-a836-990fffc593f3',
            name: "Back Squat",
            type: "strength",
            sets: 3,
            reps: 10,
            weight: 210
        },
        {
            exercise_id: 'dab222f0-3d39-4d8e-ae61-64a6d0dadd62',
            name: "Trail running",
            type: "duration",
            duration_minutes: 45,
            duration_seconds: 22
        }
    ]
}
// Create spy/test objects for the chained methods
// These will be used to mock the behaviour/functions of EditWorkout
const { mockFetchWorkoutLog, 
        mockIsEditing,
        mockSuccess,
        mockSelect, 
        mockFrom, 
        mockUpdate, 
        mockInsert, 
        mockRpc, 
        mockGetUser, 
        mockDelete } = vi.hoisted(() => ({
            mockFetchWorkoutLog: vi.fn(),
            mockSelect: vi.fn(),
            mockFrom: vi.fn(),
            mockUpdate: vi.fn(),
            mockInsert: vi.fn(),
            mockRpc: vi.fn(),
            // mockGetUser: vi.fn(), Does this get the user? Or simply compare a value of auth.uid() in the DB?
            mockDelete: vi.fn(),
        }));

/**
 * Mock the entire supabase module from EditWorkout
 * Supabase executes SELECT/FROM, UPDATE, INSERT, DELETE
 */
vi.mock('../utils/supabaseClient', () => ({
    supabase: {
        from: mockFrom,
        rpc: mockRpc
    }
}));

const renderEditWorkout = () => {
    render(
        <EditWorkout 
            fetchWorkoutLog={mockFetchWorkoutLog}
            workout={testWorkout}
        />
    );
};


/**
 * Reset mockCall history before each test
 * Also reset mock return and resolve values? 
 */
beforeEach(() => {
    vi.clearAllMocks();
});

describe("EditWorkout", () => {

    // Test 1: EditWorkout form actually renders
    it("renders non-conditional edit workout form fields", () => {
        renderEditWorkout();

        expect(screen.getByLabelText(/Workout Date/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /add another exercise/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    // Test 2: Renders exercise names from selected workouts 
    it("renders exercise names and types from the selected workout", () => {
        renderEditWorkout();
        
        expect(screen.getByDisplayValue("Back Squat")).toBeInTheDocument();
        expect(screen.getByDisplayValue("strength")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Trail running")).toBeInTheDocument();
        expect(screen.getByDisplayValue("duration")).toBeInTheDocument();
    });

    // Test 3: Renders strength metrics 
    it("renders strength exercise metrics", () => {
        renderEditWorkout();

        expect(screen.getByLabelText(/Sets/i)).toHaveValue(3);
        expect(screen.getByLabelText(/Reps/i)).toHaveValue(10);
        expect(screen.getByLabelText(/Weight \(lbs\)/i)).toHaveValue(210);
    });

    // Test 4: Renders duration metrics 
    it("renders duration exercise metrics", () => {
        renderEditWorkout();

        expect(screen.getByLabelText(/Duration \(minutes\)/i)).toHaveValue(45);
        expect(screen.getByLabelText(/Duration \(seconds\)/i)).toHaveValue(22);
    });

    // Test 5: Renders remove exercise button with multiple exercises
    it("renders remove exercise button with multiple exercises", () => {
        renderEditWorkout();

        expect(screen.getAllByText(/Remove Exercise/i)).toHaveLength(2);
    });

    // Test 5: Client-side validation should block submission before Supabase is contacted
    it("shows errors when edit workout has empty or invalid inputs", async () => {
        const user = userEvent.setup();
        renderEditWorkout();

        // Mimic user events that capture invalid inputs
        // User changes pre-loaded form data to input "0" or empty seconds
        const durationSeconds = screen.getByLabelText(/Duration \(seconds\)/i);
        await user.clear(durationSeconds);

        // Mock click edit workout 
        await user.click(screen.getByRole("button", { name: /Save Changes/i }));
        
        // Expect an error message and the edit function to not be called
        expect(await screen.findByText(/Duration \(seconds\) is required\./i)).toBeInTheDocument();
        expect(mockRpc).not.toHaveBeenCalled();
    })
});