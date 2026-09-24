/**
 * ForgotPassword.test.jsx
 * Integration tests for the ForgotPassword component.
 *
 *
 * Coverage:
 * - Renders required form field, return to sign in link, and supporting text content
 * - Blocks submission on client-side validation failure (missing or invalid email)
 *      and confirms resetPasswordWithEmail is not called in those cases
 * - Surfaces visible error messages with empty or invalid email inputs
 * - Submits the payload regardless of email presence in DB,
 *      and displays a safe & secure success message when a valid email is submitted.
 * - Surface visible error message when Supabase returns an error
 *
 * Not covered (intentionally deferred):
 * - Real success case of email receipt
 *      - Test only covers valid email submission. Supabase handles email verification within the DB.
 *
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
  supabase.auth.resetPasswordForEmail.mockResolvedValue({
    data: {},
    error: null,
  });
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

  // Test 2: Blocks form submission with empty email
  it("blocks form submission and does not call supabase with empty email", async () => {
    renderForgotPassword();

    const user = userEvent.setup();
    const button = screen.getByRole("button", {
      name: /request password reset email/i,
    });
    await user.click(button);

    const errorMessage = await screen.findByText(/email address is required/i);
    expect(errorMessage).toBeInTheDocument();

    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
  // Test 3: Blocks form submission with invalid email
  it("blocks form submission and does not call supabase with invalid email", async () => {
    renderForgotPassword();

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email address/i), "noemail@invalid");

    const button = screen.getByRole("button", {
      name: /request password reset email/i,
    });
    await user.click(button);

    const errorMessage = await screen.findByText(/invalid email address/i);
    expect(errorMessage).toBeInTheDocument();

    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  // Test 4: Displays a safe & secure confirmation message with valid email submission
  it("renders a safe and secure success message with valid email submission", async () => {
    renderForgotPassword();

    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText(/email address/i),
      "validemail@gmail.com",
    );

    const button = screen.getByRole("button", {
      name: /request password reset email/i,
    });
    await user.click(button);

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalled();
    expect(
      screen.getByText(
        /if an account is associated with this email \(validemail@gmail.com\), you will receive a password reset link shortly\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please check your inbox and spam folders\./),
    ).toBeInTheDocument(); // Safe & secure
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  // Test 5: Shows a generic error message when supabase returns an error
  it("shows a generic error message when supabase returns an error", async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
      data: null,
      error: { message: "Network error" },
    });

    renderForgotPassword();
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText(/email address/i),
      "validemail@gmail.com",
    );
    await user.click(
      screen.getByRole("button", { name: /request password reset email/i }),
    );
    expect(
      await screen.findByText(
        /unable to send a verification email\. please try again\./i,
      ),
    ).toBeInTheDocument();
  });
});
