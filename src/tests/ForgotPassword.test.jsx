/**
 * ForgotPassword.test.jsx
 * Integration tests for the ForgotPassword component.
 *
 *
 * Coverage:
 *
 *
 * Not covered (intentionally deferred):
 *
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { supabase } from "../utils/supabaseClient";
import ForgotPassword from "../components/forgotPassword/forgotPassword";

// Only mocking what ForgotPassword.jsx actually calls —
vi.mock("../utils/supabaseClient", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

// ForgotPassword renders a <Link> — needs router context
const renderForgotPassword = () => {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );
};

// Reset mock call history before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe("ForgotPassword", () => {
  // Test 1: Renders the form
  it("renders text content and required form field", () => {
    renderForgotPassword();

    expect(
      screen.getByRole("link", { name: /return to sign in/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/forgot password email verification/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /please enter the email address associated with your account/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /request password reset email/i }),
    ).toBeInTheDocument();
  });
});
