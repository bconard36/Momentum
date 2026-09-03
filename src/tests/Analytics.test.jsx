/**
 * Analytics.test.jsx
 * Unit tests for accruate analytics calculations.
 *
 * Mocks workout data so no fetch requests are needed
 *
 * Coverage:
 *  - Renders Analytics component correctly
 *  - Successfully displays components for analysis:
 *      - 30 day count
 *      - Empty workout streak
 *      - Exercise splits by type
 *
 * Not covered (intentionally deferred):
 *  - Component-specific calculations (to be housed in each individual test file)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { userEvent } from "@testing-library/user-event";
import Analytics from "../components/analytics/Analytics";
import { mockWorkouts } from "../mock/mockWorkouts";

const renderAnalytics = () => {
  render(
    <MemoryRouter>
      <Analytics workouts={mockWorkouts} />
    </MemoryRouter>,
  );
};

// Reset mock call history before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe("Analytics", () => {
  // Test 1 - renders the form
  it("successfully renders the analytics components", () => {
    renderAnalytics();

    expect(
      screen.getByText(/total workouts in the last 30 days/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no workouts logged for the past two days/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /start a streak/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/total exercises/i)).toBeInTheDocument();
    expect(screen.getByText(/strength exercises/i)).toBeInTheDocument();
    expect(screen.getByText(/duration exercises/i)).toBeInTheDocument();
  });
});
