/**
 * WorkoutStreak.test.jsx
 * Unit tests for the WorkoutStreak analytics component.
 *
 * "Today" is pinned the same way as ThirtyDayCount.test.jsx, for the
 * same reason: streak math is entirely relative to the current date.
 *
 * Coverage:
 *  - Empty state (no workouts at all)
 *  - No-recent-activity state (last workout more than 1 day ago)
 *  - A single workout today counts as a streak of 1
 *  - A single workout yesterday (not today) still counts as a streak of 1
 *  - A run of consecutive days produces the correct streak length
 *  - A gap in the middle of the dates stops the streak count at the gap
 *  - Duplicate same-day workouts are deduped rather than double-counted
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import WorkoutStreak from "../components/analytics/WorkoutStreak";

const FIXED_TODAY = new Date(2026, 7, 24); // Aug 24, 2026 (local)

const daysAgoStr = (n) => {
  const d = new Date(FIXED_TODAY);
  d.setDate(d.getDate() - n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const renderStreak = (workouts) => {
  render(
    <MemoryRouter>
      <WorkoutStreak workouts={workouts} />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("WorkoutStreak", () => {
  // Test 1 - shows empty state message with the workout form link
  it("shows the empty-state message when there are no workouts", () => {
    renderStreak([]);
    expect(screen.getByText(/no workouts logged yet/i)).toBeInTheDocument();
  });

  // Test 2 - Shows a no activity message and a link to the workout log
  it("shows the no-recent-activity message when the last workout was more than a day ago", () => {
    renderStreak([{ date: daysAgoStr(3) }]);
    expect(
      screen.getByText(/no workouts logged for the past two days/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start a streak/i }),
    ).toBeInTheDocument();
  });
  // Test 3 - logs a streak of 1 correctly for a workout logged today
  it("counts a streak of 1 for a workout logged today", () => {
    renderStreak([{ date: daysAgoStr(0) }]);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(/keep the streak alive/i)).toBeInTheDocument();
  });

  // Test 4 - logs a streak of 1 for a workout logged yesterday but not today
  it("counts a streak of 1 for a workout logged yesterday but not today", () => {
    renderStreak([{ date: daysAgoStr(1) }]);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  // Test 5 - Counts a 3 day streak across consecutive days
  it("counts a 3-day streak across consecutive days", () => {
    renderStreak([
      { date: daysAgoStr(0) },
      { date: daysAgoStr(1) },
      { date: daysAgoStr(2) },
    ]);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // Test 6 - stops counting when the streak breaks
  it("stops counting at a gap in the dates", () => {
    renderStreak([
      { date: daysAgoStr(0) },
      { date: daysAgoStr(1) },
      // gap at 2 days ago
      { date: daysAgoStr(3) },
      { date: daysAgoStr(4) },
    ]);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  // Test 7 - only counts distinct days, logs 1 for 2 workouts logged in the same day
  it("dedupes multiple workouts logged on the same day", () => {
    renderStreak([
      { date: daysAgoStr(0) },
      { date: daysAgoStr(0) },
      { date: daysAgoStr(1) },
    ]);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
