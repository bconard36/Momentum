import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import EditWorkout from '../components/EditWorkout';

// Create a test workout object to be used in the test
const testWorkout= {
    workout_id: '5722dcd3-7219-4613-99e5-79fae1971404',
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
        mockFrom, 
        mockSelect,
        mockMatch,
        mockRpc, 
        mockSuccess,
        mockDelete } = vi.hoisted(() => ({
            mockFetchWorkoutLog: vi.fn(),
            mockFrom: vi.fn(),
            mockSelect: vi.fn(),
            mockMatch: vi.fn(),
            mockRpc: vi.fn(),
            mockSuccess: vi.fn(),
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
            onUpdateSuccess={mockSuccess}
        />
    );
};


/**
 * Reset mockCall history before each test
 * Also reset mock return and resolve values? 
 */
beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
        select: mockSelect
    });

    mockSelect.mockReturnValue({
        match: mockMatch
    });

    mockMatch.mockResolvedValue({
        data: [],
        error: null,
    });

    mockRpc.mockResolvedValue({
        data: null,
        error: null
    });
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

    // Test 6: Client-side validation should block submission before Supabase is contacted
    it("shows errors when edit workout has empty or invalid inputs", async () => {
        const user = userEvent.setup();
        renderEditWorkout();

        // Mimic user events that capture invalid inputs
        // User changes pre-loaded form data to input "0" or empty 
        const weight = screen.getByLabelText(/Weight \(lbs\)/i);
        const durationSeconds = screen.getByLabelText(/Duration \(seconds\)/i);
        await user.clear(weight);
        await user.clear(durationSeconds);

        // Mock click edit workout 
        await user.click(screen.getByRole("button", { name: /Save Changes/i }));
        
        // Expect an error message and the edit function to not be called
        expect(await screen.findByText(/Weight is required\./i)).toBeInTheDocument();
        expect(await screen.findByText(/Duration \(seconds\) is required\./i)).toBeInTheDocument();
        expect(mockRpc).not.toHaveBeenCalled();
    });

    // Test 7: Remove Exercise button hidden with only one exercise listed 
    it("hides remove exercise button when only one exercise remains", async () => {
        const user = userEvent.setup();
        renderEditWorkout();

        const removeExerciseButtons = screen.getAllByRole("button", { name: /Remove Exercise/ });

        // Mimic user clicking remove exercise 
        // 2 exercises in test data, this should drop down to one 
        // Mimic a user click of the second button
        await user.click(removeExerciseButtons[1]);

        // // Then expect the first button to disappear
        expect(screen.queryByRole("button", { name: /Remove Exercise/ })).not.toBeInTheDocument();
    });

    // Test 8: valid updated form data should reach supabase with the correct shape
    it("calls supabase.rpc() with the correct data upon form submission", async () => {
        const user = userEvent.setup();
        renderEditWorkout();

        // User makes changes to the workout metrics 
        await user.clear(screen.getByLabelText(/Sets/i));
        await user.type(screen.getByLabelText(/Sets/i), "5");

        await user.clear(screen.getByLabelText(/Reps/i));
        await user.type(screen.getByLabelText(/Reps/i), "5");

        await user.clear(screen.getByLabelText(/Weight \(lbs\)/i));
        await user.type(screen.getByLabelText(/Weight \(lbs\)/i), "210");

        await user.clear(screen.getByLabelText(/Duration \(minutes\)/i));
        await user.type(screen.getByLabelText(/Duration \(minutes\)/i), "75");

        await user.clear(screen.getByLabelText(/Duration \(seconds\)/i));
        await user.type(screen.getByLabelText(/Duration \(seconds\)/i), "30");

        const mockPayload = {
            p_workout_id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            ),
            resolved_workout: {
                date: "2026-08-24",
                exercises: [
                    {
                        exercise_id: expect.stringMatching(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        ),
                        name: "Back Squat",
                        type: "strength",
                        sets: 5,
                        reps: 5,
                        weight: 210
                    },
                    {
                        exercise_id: expect.stringMatching(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        ),
                        name: "Trail running",
                        type: "duration",
                        duration_minutes: 75,
                        duration_seconds: 30
                    }
                ]
            }
        };

        await user.click(screen.getByRole("button", { name: /save changes/i }));

        await waitFor(() => {
            expect(mockRpc).toHaveBeenCalledWith(
                "edit_workout",
                mockPayload
            );
        });

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalled();
        });
    });

    // Test 9: valid form data with a new exercise reaches supabase with the correct shape for insert and update
    it("inserts a new exercise (if found) when a new exercise is added", async () => {
        const user = userEvent.setup();
        renderEditWorkout();
        await user.click(screen.getByRole("button", { name: /add another exercise/i }));

        // User types exercise name and selects a new exercise type
        // That type will conditionally render the new exercise input fields
        const exerciseNames = screen.getAllByLabelText("Exercise Name");
        await user.type(exerciseNames[2], "hamstring curls");

        const newExerciseType = screen.getByRole('combobox');
        await user.selectOptions(newExerciseType, 'strength');
         
        const weights = await screen.findAllByLabelText(/Weight \(lbs\)/i);
        const sets = await screen.findAllByLabelText(/Sets/i);
        const reps = await screen.findAllByLabelText(/Reps/i);

        await user.type(weights[1], "100");
        await user.type(sets[1], "5");
        await user.type(reps[1], "5");

        const newExercisePayload = {
            p_workout_id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            ),
            resolved_workout: {
                date: "2026-08-24",
                exercises: [
                    {
                        exercise_id: expect.stringMatching(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        ),
                        name: "Back Squat",
                        type: "strength",
                        sets: 3,
                        reps: 10,
                        weight: 210,
                        duration_minutes: undefined,
                        duration_seconds: undefined,
                    },
                    {
                        exercise_id: expect.stringMatching(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        ),
                        name: "Trail running",
                        type: "duration",
                        sets: undefined,
                        reps: undefined,
                        weight: undefined,
                        duration_minutes: 45,
                        duration_seconds: 22
                    },
                    {   
                        exercise_id: expect.stringMatching(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        ),
                        name: "hamstring curls",
                        type: "strength",
                        sets: 5,
                        reps: 5,
                        weight: 100,
                        duration_minutes: undefined,
                        duration_seconds: undefined
                    }
                ]
            }
        };

        // Save changes
        await user.click(screen.getByRole("button", { name: /save changes/i }));

         await waitFor(() => {
            expect(mockRpc).toHaveBeenCalledWith(
                "edit_workout",
                newExercisePayload
            );
        });

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalled();
        });
    });

    // Test 10: Removing of an exercise from a workout 
    it("removes an exercise and sends updated data to supabase with the correct shape", async () => {
        const user = userEvent.setup();
        renderEditWorkout();

        const removeExerciseButtons = screen.getAllByRole("button", { name: /Remove Exercise/ });

        // User removes first exercise 
        await user.click(removeExerciseButtons[0]);

        // 
        const updatedPayload= {
            p_workout_id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            ),
            resolved_workout: {
                date: "2026-08-24",
                exercises: [                
                    {
                        exercise_id: expect.stringMatching(
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        ),
                        name: "Trail running",
                        type: "duration",
                        duration_minutes: 45,
                        duration_seconds: 22
                    }
                ]
            }
        }

         // Save changes
        await user.click(screen.getByRole("button", { name: /save changes/i }));

         await waitFor(() => {
            expect(mockRpc).toHaveBeenCalledWith(
                "edit_workout",
                updatedPayload
            );
        })

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalled();
        });
    });
});