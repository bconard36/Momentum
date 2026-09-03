/**
 * WorkoutForm.test.jsx
 * Unit tests for the WorkoutForm component.
 *
 * Mocks Supabase connection and methods so no real network requests reach Supabase.
 *  - .from(), .select(), .match(), .rpc(), & getUser()
 *
 * Coverage:
 *  - Renders correct empty state WorkoutForm
 *  - Renders correct initial render of WorkoutForm with only date and type fields visible
 *  - Conditionally renders exercise metrics based on exercise-type
 *  - Blocks submission on client-side validation failure (missing required fields)
 *  - Submits the correct payload shape to mockRpc()
 *  - Renders a success message and resets to empty state on successful submission
 *
 * Not covered (intentionally deferred):
 *  - Navigating to the workout log("/logs") from the workout form
 *  - Additional input format edge cases
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import WorkoutForm from "../components/WorkoutForm";

// Create spy/test objects for the chained methods
const {
  mockFetchWorkoutLog,
  mockSelect,
  mockFrom,
  mockMatch,
  mockRpc,
  mockGetUser,
} = vi.hoisted(() => ({
  mockFetchWorkoutLog: vi.fn(),
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockMatch: vi.fn(),
  mockRpc: vi.fn(),
  mockGetUser: vi.fn(),
}));

// UUID Regex string matching constant for payload checks
const UUID_REGEX = expect.stringMatching(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
);

/**
 * Mock the entire supabase module for WorkoutForm
 * Supabase executes SELECT/FROM, rpc, and getUser()
 */
vi.mock("../utils/supabaseClient", () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
    auth: {
      getUser: mockGetUser,
    },
  },
}));

/**
 * WorkoutForm renders a <Link> to WorkoutLog
 * Router context to avoid errors
 * Spy object used as prop
 */
const renderWorkoutForm = () => {
  render(
    <MemoryRouter>
      <WorkoutForm fetchWorkoutLog={mockFetchWorkoutLog} />
    </MemoryRouter>,
  );
};

/**
 * Reset mockCall history before each test
 * Resets mock return and resolve values for Supabase methods:
 *      - From, Select, Match, RPC
 */
beforeEach(() => {
  vi.clearAllMocks();

  mockGetUser.mockResolvedValue({
    data: {
      user: {
        id: "test-user-id",
      },
    },
  });

  mockFrom.mockReturnValue({
    select: mockSelect,
  });

  mockSelect.mockReturnValue({
    match: mockMatch,
  });

  mockMatch.mockResolvedValue({
    data: [],
    error: null,
  });

  mockRpc.mockResolvedValue({
    data: null,
    error: null,
  });
});

describe("WorkoutForm", () => {
  // Test 1 - Empty State WorkoutForm renders
  it("renders empty state workout form", () => {
    renderWorkoutForm();

    expect(
      screen.getByRole("button", { name: /Build New Workout/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View Workout Log/i }),
    ).toBeInTheDocument();
  });

  // Test 2 - Renders Workout Date and Type after clicking Build New Workout
  it("renders empty state workout form with only workout date and type", async () => {
    const user = userEvent.setup();
    renderWorkoutForm();

    // Form fields do not render until Build New Workout button is clicked
    await user.click(
      screen.getByRole("button", { name: /Build New Workout/i }),
    );

    expect(screen.getByLabelText(/Workout Date/i)).toBeInTheDocument();
    expect(screen.getByText(/Workout Type/i)).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /Duration/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /Repetition/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add Another Exercise/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clear Exercise/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save Workout/i }),
    ).toBeInTheDocument();
  });

  // Test 3 - Renders complete duration type-based workouts form with all necessary fields
  it("renders complete duration type-based workout form with necessary fields", async () => {
    const user = userEvent.setup();
    renderWorkoutForm();

    // Form fields do not render until Build New Workout button is clicked
    await user.click(
      screen.getByRole("button", { name: /Build New Workout/i }),
    );

    // Metric fields do not render until type has been selected
    await user.click(screen.getByRole("radio", { name: /Duration/i }));

    expect(screen.getByLabelText(/Exercise Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration \(minutes\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration \(seconds\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add Another Exercise/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clear Exercise/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save Workout/i }),
    ).toBeInTheDocument();
  });

  // Test 4 - Renders complete repetition type-based workouts form with all necessary fields
  it("renders complete repetition type-based workout form with necessary fields", async () => {
    const user = userEvent.setup();
    renderWorkoutForm();

    // Form fields do not render until Build New Workout button is clicked
    await user.click(
      screen.getByRole("button", { name: /Build New Workout/i }),
    );

    // Metric fields do not render until type has been selected
    await user.click(screen.getByRole("radio", { name: /Repetition/i }));

    expect(screen.getByLabelText(/Exercise Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Weight \(lbs\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sets/i)).toBeInTheDocument();
    expect(screen.getByText(/Reps/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add Another Exercise/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clear Exercise/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save Workout/i }),
    ).toBeInTheDocument();
  });

  // Test 5 - Client-side validation should block submission before Supabase is contacted
  it("shows an error when workout form has empty inputs", async () => {
    const user = userEvent.setup();
    renderWorkoutForm();

    // Form fields do not render until Build New Workout button is clicked
    await user.click(
      screen.getByRole("button", { name: /Build New Workout/i }),
    );

    // Metric fields do not render until type has been selected
    await user.click(screen.getByRole("radio", { name: /Repetition/i }));

    // Capture incomplete/invalid metric fields
    await user.type(screen.getByLabelText(/exercise name/i), "Bench Press");
    await user.type(screen.getByLabelText(/Weight \(lbs\)/i), "-10");
    await user.type(screen.getByLabelText(/sets/i), "500");
    await user.type(screen.getByLabelText(/Reps/i), "''");

    // Mock the save workout
    await user.click(screen.getByRole("button", { name: /Save Workout/i }));

    // findBy waits for the error to appear
    expect(mockRpc).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/weight cannot be negative./i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/set count cannot exceed 100./i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/rep count is required./i),
    ).toBeInTheDocument();
  });

  // Test 6 - valid form data should reach supabase with the correct shape
  it("calls supabase.rpc() with correct workout data on valid submission", async () => {
    const user = userEvent.setup();
    renderWorkoutForm();

    // Form fields do not render until Build New Workout button is clicked
    await user.click(
      screen.getByRole("button", { name: /Build New Workout/i }),
    );

    await user.type(screen.getByLabelText(/Workout Date/i), "2026-08-24");

    // Metric fields do not render until type has been selected
    await user.click(screen.getByRole("radio", { name: /Duration/i }));

    // Capture incomplete/invalid metric fields
    await user.type(screen.getByLabelText(/exercise name/i), "Outdoor run");
    await user.type(screen.getByLabelText(/Duration \(minutes\)/i), "30");
    await user.type(screen.getByLabelText(/Duration \(seconds\)/i), "47");

    // Mock the save workout
    await user.click(screen.getByRole("button", { name: /Save Workout/i }));

    // Store the 'payload' - form data
    // Form data must match the exact data structure of DB
    // 3 tables - workouts, exercises, then workout_exercises
    const mockPayload = {
      workout_entry: {
        workout_id: UUID_REGEX,
        date: "2026-08-24",
      },
      resolved_exercises: [
        {
          exercise_id: UUID_REGEX,
          type: "duration",
          name: "outdoor run",
        },
      ],
      workout_exercise_list: [
        {
          workout_id: UUID_REGEX,
          exercise_id: UUID_REGEX,
          weight: undefined,
          sets: undefined,
          reps: undefined,
          duration_minutes: 30,
          duration_seconds: 47,
        },
      ],
    };

    // Wait for RPC named save_workout to be called with the mock payload data
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("save_workout", mockPayload);
    });
  });

  // Test 7 - shows success message and resets to after successful save
  it("shows success message and resets to empty state after a successful save", async () => {
    const user = userEvent.setup();
    renderWorkoutForm();

    // Form fields do not render until Build New Workout button is clicked
    await user.click(
      screen.getByRole("button", { name: /Build New Workout/i }),
    );

    await user.type(screen.getByLabelText(/Workout Date/i), "2026-08-24");

    // Metric fields do not render until type has been selected
    await user.click(screen.getByRole("radio", { name: /Duration/i }));

    // Capture incomplete/invalid metric fields
    await user.type(screen.getByLabelText(/exercise name/i), "Outdoor run");
    await user.type(screen.getByLabelText(/Duration \(minutes\)/i), "30");
    await user.type(screen.getByLabelText(/Duration \(seconds\)/i), "47");

    // Mock the save workout
    await user.click(screen.getByRole("button", { name: /Save Workout/i }));

    // Store the 'payload' - form data
    // Form data must match the exact data structure of DB
    // 3 tables - workouts, exercises, then workout_exercises
    const mockPayload = {
      workout_entry: {
        workout_id: UUID_REGEX,
        date: "2026-08-24",
      },
      resolved_exercises: [
        {
          exercise_id: UUID_REGEX,
          type: "duration",
          name: "outdoor run",
        },
      ],
      workout_exercise_list: [
        {
          workout_id: UUID_REGEX,
          exercise_id: UUID_REGEX,
          weight: undefined,
          sets: undefined,
          reps: undefined,
          duration_minutes: 30,
          duration_seconds: 47,
        },
      ],
    };

    // Wait for RPC named save_workout to be called with the mock payload data
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("save_workout", mockPayload);
    });

    // Expect to see a success message after saving the workout
    expect(
      await screen.findByText(/Success[!]\s+Workout Saved[!]/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /Build New Workout/i }),
    ).toBeInTheDocument();
  });
});
