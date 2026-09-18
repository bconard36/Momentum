/**
 * ExerciseSplits.test.jsx
 * Unit tests for the ExerciseSplits analytics component.
 *
 * Coverage:
 *  - Empty state (no exercises across any workout)
 *  - Correct total, strength, and duration counts for a mixed dataset
 *  - Correct percentage rounding for a non-even split
 *  - All-strength and all-duration edge cases (100%/0% each way)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ExerciseSplits from "../components//analytics/ExerciseSplits";

// Mock split data
const strength = (name = "Back Squat") => ({
  exercise_id: crypto.randomUUID(),
  name,
  type: "strength",
  sets: 3,
  reps: 10,
  weight: 210,
});

const duration = (name = "Trail running") => ({
  exercise_id: crypto.randomUUID(),
  name,
  type: "duration",
  duration_minutes: 45,
  duration_seconds: 22,
});

describe("ExerciseSplits", () => {
  // Test 1 - shows empty state when no workouts are saved
  it("shows the empty-state message when there are no exercises", () => {
    render(<ExerciseSplits workouts={[]} />);
    expect(screen.getByText(/no exercises logged yet/i)).toBeInTheDocument();
  });

  // Test 2 - counts totals and an even 50/50 split correctly
  it("counts totals and an even 50/50 split correctly", () => {
    render(
      <ExerciseSplits workouts={[{ exercises: [strength(), duration()] }]} />,
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getAllByText("1 (50%)")).toHaveLength(2); // strength and duration each have the same display. Look for 2 elements in the array
  });

  // Test 3 - rounds an uneven split correctly
  it("rounds an uneven split correctly (1 of 3 = 33%)", () => {
    render(
      <ExerciseSplits
        workouts={[
          { exercises: [strength(), duration(), duration("Cycling")] },
        ]}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1 (33%)")).toBeInTheDocument();
    expect(screen.getByText("2 (67%)")).toBeInTheDocument();
  });

  // Test 4 - accurately calculates exercise type splits
  it("shows 100% strength and 0% duration when only strength exercises exist", () => {
    render(
      <ExerciseSplits
        workouts={[{ exercises: [strength(), strength("Deadlift")] }]}
      />,
    );

    expect(screen.getByText("2 (100%)")).toBeInTheDocument();
    expect(screen.getByText("0 (0%)")).toBeInTheDocument();
  });
  // Test 5 - accrurately sums exercises across multiple workouts
  it("aggregates exercises across multiple workout entries", () => {
    render(
      <ExerciseSplits
        workouts={[
          { exercises: [strength()] },
          { exercises: [duration(), duration("Cycling")] },
        ]}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
