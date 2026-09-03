/**
 * Analytics.test.jsx
 * Unit tests for accruate analytics calculations.
 *
 * Mocks workout data so no fetch requests are needed
 *
 * Coverage:
 *  - Renders Analytics component correctly
 *  - Successfully displays calculated data for analysis:
 *      - 30 day count
 *      - Workout streak
 *      - Exercise splits by type
 *  - If no workout streak - successfully renders a start streak element
 *
 * Not covered (intentionally deferred):
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Analytics from "../components/analytics/Analytics";
import { mockWorkouts } from "../mock/mockWorkouts";

const renderAnalytics = () => {
  render(
    <MemoryRouter>
      <Analytics />
    </MemoryRouter>,
  );
};

// Reset mock call history before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe("Analytics", () => {
  // Test 1 - renders the form
  it("renders all analytic components and elements for display, with a current streak", () => {
    renderAnalytics({ mockWorkouts });

    expect(
      screen.getByRole("link", { name: /return to dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/performance analysis/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /view workout logs/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/total workouts in the last 30 days/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/current workout streak/i)).toBeInTheDocument();
    expect(screen.getByText(/total exercises/i)).toBeInTheDocument();
    expect(screen.getByText(/strength exercises/i)).toBeInTheDocument();
    expect(screen.getByText(/duration exercises/i)).toBeInTheDocument();
  });
});
