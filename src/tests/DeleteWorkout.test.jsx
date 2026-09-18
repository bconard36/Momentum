/**
 * DeleteWorkout.test.jsx
 * Unit tests for deleting a workout.
 *
 * Mocks Supabase so no real network requests reach Supabase.
 *  - fetchWorkoutLog, deleteWorkout
 *
 * Coverage:
 *  - Renders the delete confirmation window once delete workout is clicked
 *  - Successfully deletes a workout
 *  - Successfully renders a confirmation window after deletion
 *
 * Not covered (intentionally deferred):
 *  - Cancelling a workout delete removes delete confirm
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import WorkoutLog from "../components/WorkoutLog";

const { mockFetchWorkoutLog, mockDelete } = vi.hoisted(() => ({
  mockFetchWorkoutLog: vi.fn(),
  mockDelete: vi.fn(),
}));

// Create and store mock workout data with multiple exercises
const mockWorkouts = [
  {
    workout_id: "5722dcd3-7219-4613-99e5-79fae1971404",
    date: "2026-08-24",
    exercises: [
      {
        exercise_id: "2fb945d6-cbae-4261-a836-990fffc593f3",
        name: "Back Squat",
        type: "strength",
        sets: 3,
        reps: 10,
        weight: 210,
        duration_minutes: null,
        duration_seconds: null,
      },
      {
        exercise_id: "dab222f0-3d39-4d8e-ae61-64a6d0dadd62",
        name: "Trail running",
        type: "duration",
        sets: null,
        reps: null,
        weight: null,
        duration_minutes: 45,
        duration_seconds: 22,
      },
    ],
  },
  {
    workout_id: "2ddbb0f4-7266-436e-92a1-c4b8edeae2d9",
    date: "2026-08-20",
    exercises: [
      {
        exercise_id: "2fb945d6-cbae-4261-a836-990fffc593f3",
        name: "Back Squat",
        type: "strength",
        sets: 3,
        reps: 10,
        weight: 210,
        duration_minutes: null,
        duration_seconds: null,
      },
      {
        exercise_id: "dab222f0-3d39-4d8e-ae61-64a6d0dadd62",
        name: "Trail running",
        type: "duration",
        sets: null,
        reps: null,
        weight: null,
        duration_minutes: 45,
        duration_seconds: 22,
      },
    ],
  },
  {
    workout_id: "ef3e3927-a5e3-4ca1-aac0-3eacd2998c17",
    date: "2026-08-10",
    exercises: [
      {
        exercise_id: "2fb945d6-cbae-4261-a836-990fffc593f3",
        name: "Back Squat",
        type: "strength",
        sets: 3,
        reps: 10,
        weight: 210,
        duration_minutes: null,
        duration_seconds: null,
      },
      {
        exercise_id: "dab222f0-3d39-4d8e-ae61-64a6d0dadd62",
        name: "Trail running",
        type: "duration",
        sets: null,
        reps: null,
        weight: null,
        duration_minutes: 45,
        duration_seconds: 22,
      },
    ],
  },
];

//
vi.mock("../utils/supabaseClient", () => ({
  supabase: {
    delete: mockDelete,
  },
}));

/**
 * WorkoutLog renders a <Link> to WorkoutLog
 * Router context to avoid errors
 * Spy objects used as props
 */
const renderWorkoutLog = () => {
  render(
    <MemoryRouter>
      <WorkoutLog
        savedWorkouts={mockWorkouts}
        fetchWorkoutLog={mockFetchWorkoutLog}
        deleteWorkout={mockDelete}
      />
    </MemoryRouter>,
  );
};

/**
 * Reset mockCall history before each test
 * Resets mock resolve values for deleteWorkout
 */
beforeEach(() => {
  vi.clearAllMocks();
  mockDelete.mockResolvedValue({
    data: null,
    error: null,
    success: true,
  });
});

describe("DeleteWorkout", () => {
  // Test 1: DeleteWorkout confirmation modal appears
  it("renders a delete confirmation window before deletion", async () => {
    const user = userEvent.setup();
    renderWorkoutLog();

    // One delete (log) and one confirm delete (modal)
    // Capture both and await the userClick on the first button
    const deleteButton = screen.getAllByRole("button", {
      name: /delete workout/i,
    });
    await user.click(deleteButton[0]);

    expect(await screen.findByText("Delete workout?")).toBeInTheDocument();
    expect(
      await screen.findByText(/this action cannot be undone\./i),
    ).toBeInTheDocument();
  });

  // Test 2: Workout is successfully deleted
  it("successfully deletes a workout", async () => {
    const user = userEvent.setup();
    renderWorkoutLog();
    const idToDelete = "5722dcd3-7219-4613-99e5-79fae1971404";

    // One delete (log) and one confirm delete (modal)
    // Capture both and await the userClick on the first button (first workout)
    const deleteButton = screen.getAllByRole("button", {
      name: /delete workout/i,
    });
    await user.click(deleteButton[0]);

    const modalHeading = await screen.findByText("Delete workout?");
    const modal = modalHeading.closest(".delete-overlay");

    const confirmButton = within(modal).getByRole("button", {
      name: /delete workout/i,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(idToDelete);
    });
  });

  // Test 3 - renders a confirmation window after successful deletion
  it("shows a success message after a workout is deleted", async () => {
    const user = userEvent.setup();
    renderWorkoutLog();
    const idToDelete = "5722dcd3-7219-4613-99e5-79fae1971404";

    const deleteButton = screen.getAllByRole("button", {
      name: /delete workout/i,
    });
    await user.click(deleteButton[0]);

    const modalHeading = await screen.findByText("Delete workout?");
    const modal = modalHeading.closest(".delete-overlay");

    const confirmButton = within(modal).getByRole("button", {
      name: /delete workout/i,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(idToDelete);
    });

    const successModalHeading = await screen.findByText(
      "Your workout has been deleted.",
    );
    const successModal = successModalHeading.closest(".success-overlay");
    const returnButton = within(successModal).getByRole("button", {
      name: /back to workout log/i,
    });

    expect(successModalHeading).toBeInTheDocument();
    expect(returnButton).toBeInTheDocument();
  });
});
