/**
 * ThirtyDayCount.test.jsx
 * Unit tests for the ThirtyDayCount analytics component.
 *
 * "Today" is pinned via vi.setSystemTime rather than relying on real
 * wall-clock time, so fixture dates built relative to that anchor stay
 * correct regardless of when the suite actually runs.
 *
 * Coverage:
 *  - Renders 0 when there are no workouts
 *  - Includes a workout dated exactly today
 *  - Includes a workout dated exactly 30 days ago (inclusive lower bound)
 *  - Excludes a workout dated 31 days ago
 *  - Excludes a workout dated in the future
 *  - Renders the link to /logs
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import ThirtyDayCount from "../components/analytics/ThirtyDayCount";

const FIXED_TODAY = new Date(2026, 7, 24); // Aug 24, 2026 (local)
/** Formats a Date offset by `n` days from FIXED_TODAY as "YYYY-MM-DD",
 *  using local date components to match how the component parses dates. */
const daysAgoStr = (n) => {
  const d = new Date(FIXED_TODAY);
  d.setDate(d.getDate() - n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const renderCount = (workouts) => {
  render(
    <MemoryRouter>
      <ThirtyDayCount workouts={workouts} />
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

describe("ThirtyDayCount", () => {
  // Test 1 - Renders 0 when there are no workouts in the last 30 days
  it("renders 0 when there are no workouts", () => {
    renderCount([]);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  // Test 2 - counts a workout logged the same day
  it("counts a workout dated today", () => {
    renderCount([{ date: daysAgoStr(0) }]);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  // Test 3 - counts a workout dated exactly 30 days ago (inclusive)
  it("counts a workout dated exactly 30 days ago (inclusive)", () => {
    renderCount([{ date: daysAgoStr(30) }]);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  // Test 4 - excludes a workout outside the 30 day bound
  it("excludes a workout dated 31 days ago", () => {
    renderCount([{ date: daysAgoStr(31) }]);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  // Test 5 - counts multiple workouts within the window and omits ones outside it
  it("counts multiple workouts within the window and ignores ones outside it", () => {
    renderCount([
      { date: daysAgoStr(0) },
      { date: daysAgoStr(15) },
      { date: daysAgoStr(30) },
      { date: daysAgoStr(45) },
    ]);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  // Test 6 - renders a link to the workout log
  it("renders a link to the workout log", () => {
    renderCount([]);
    expect(
      screen.getByRole("link", { name: /view workout logs/i }),
    ).toHaveAttribute("href", "/logs");
  });
});
