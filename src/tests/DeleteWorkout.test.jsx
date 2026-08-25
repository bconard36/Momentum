import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import WorkoutLog from '../components/WorkoutLog'

const { mockFetchWorkoutLog, mockDelete, mockRpc } = vi.hoisted(() => ({
    mockFetchWorkoutLog: vi.fn(),
    mockDelete: vi.fn(),
    mockRpc: vi.fn()
}));

const mockWorkouts = [
    {
        workout_id: '5722dcd3-7219-4613-99e5-79fae1971404',
        date: "2026-08-24",
        exercises: [
            {
                exercise_id: '2fb945d6-cbae-4261-a836-990fffc593f3',
                name: "Back Squat",
                type: "strength",
                sets: 3,
                reps: 10,
                weight: 210,
                duration_minutes: null,
                duration_seconds: null,

            },
            {
                exercise_id: 'dab222f0-3d39-4d8e-ae61-64a6d0dadd62',
                name: "Trail running",
                type: "duration",
                sets: null,
                reps: null,
                weight: null,
                duration_minutes: 45,
                duration_seconds: 22
            }
        ],
    },
    {
        workout_id: '2ddbb0f4-7266-436e-92a1-c4b8edeae2d9',
        date: "2026-08-20",
        exercises: [
            {
                exercise_id: '2fb945d6-cbae-4261-a836-990fffc593f3',
                name: "Back Squat",
                type: "strength",
                sets: 3,
                reps: 10,
                weight: 210,
                duration_minutes: null,
                duration_seconds: null,
            },
            {
                exercise_id: 'dab222f0-3d39-4d8e-ae61-64a6d0dadd62',
                name: "Trail running",
                type: "duration",
                sets: null,
                reps: null,
                weight: null,
                duration_minutes: 45,
                duration_seconds: 22
            }
        ],
    },
    {
        workout_id: 'ef3e3927-a5e3-4ca1-aac0-3eacd2998c17',
        date: "2026-08-10",
        exercises: [
            {
                exercise_id: '2fb945d6-cbae-4261-a836-990fffc593f3',
                name: "Back Squat",
                type: "strength",
                sets: 3,
                reps: 10,
                weight: 210,
                duration_minutes: null,
                duration_seconds: null,
            },
            {
                exercise_id: 'dab222f0-3d39-4d8e-ae61-64a6d0dadd62',
                name: "Trail running",
                type: "duration",
                sets: null,
                reps: null,
                weight: null,
                duration_minutes: 45,
                duration_seconds: 22
            }
        ],
    }
    
]

vi.mock('../utils/supabaseClient', () => ({
    supabase: {
        rpc: mockRpc
    }
}));

const renderWorkoutLog = () => {
    render(
        <MemoryRouter>
            <WorkoutLog 
                savedWorkouts={mockWorkouts}
                fetchWorkoutLog={mockFetchWorkoutLog}
                deleteWorkout={mockDelete}
            />
        </MemoryRouter>
    );
};

beforeEach(() => {
    vi.clearAllMocks();

    mockRpc.mockResolvedValue({
        data: null,
        error: null
    });
});

describe("DeleteWorkout", () => {

    // Test 1: DeleteWorkout confirmation modal appears 
    it("renders a delete confirmation window before deletion", async () => {
        const user = userEvent.setup();
        renderWorkoutLog();

        const deleteButton = screen.getByRole("button", {  name: /delete workout/i });

        await user.click(deleteButton);

        expect(await screen.findByText("Delete workout?")).toBeInTheDocument();
        expect(await screen.findByText(/this action cannot be undone\./i)).toBeInTheDocument();

    })
   
});