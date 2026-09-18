/**
 * AccountSettings.test.jsx
 * Integration tests for the AccountSettings component.
 *
 * Mocks Supabase auth methods (signInWithPassword, updateUser, signOut)
 * so no real network requests reach Supabase, and mocks react-router's
 * useNavigate to assert on the post-password-change redirect.
 *
 * Coverage:
 *  - Mode switching renders the correct fields per mode and clears
 *    leftover errors from a previously active mode
 *  - Password-only flow: invalid credentials on reauth, and full
 *    success (updateUser call, forced global sign-out, delayed redirect)
 *  - Email & password flow: partial success/failure (password updates,
 *    email fails) and full success (both update, pending-email messaging)
 *  - The pending-email banner renders based on the user prop's
 *    new_email/email mismatch, independent of any submission in this test
 *    session (mirrors the real app, where this only updates on a fresh
 *    fetch of the user object, not immediately after submit)
 *
 * Not covered (intentionally deferred):
 *  - Email-only reset flow (shares the same updateUser call path already
 *    exercised by the email_password tests)
 *  - Live re-validation of the confirm-password match as the new-password
 *    field changes after the confirm field has already been touched
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import AccountSettings from "../components/AccountSettings";

const { mockSignInWithPassword, mockUpdateUser, mockSignOut, mockNavigate } =
  vi.hoisted(() => ({
    mockSignInWithPassword: vi.fn(),
    mockUpdateUser: vi.fn(),
    mockSignOut: vi.fn(),
    mockNavigate: vi.fn(),
  }));

vi.mock("../utils/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
  },
}));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const baseUser = { email: "old@example.com", new_email: null };

const renderAccountSettings = (userOverrides = {}) => {
  render(
    <MemoryRouter>
      <AccountSettings user={{ ...baseUser, ...userOverrides }} />
    </MemoryRouter>,
  );
};

/** Fills the three password fields shared by the password-only and
 *  email_password forms. Assumes only one active mode is rendered. */
const fillPasswordFields = async (
  user,
  { oldPassword, newPassword, confirmPassword },
) => {
  await user.type(screen.getByLabelText(/confirm old password/i), oldPassword);
  await user.type(screen.getByLabelText(/enter password/i), newPassword);
  await user.type(
    screen.getByLabelText(/^confirm password$/i),
    confirmPassword,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSignInWithPassword.mockResolvedValue({ error: null });
  mockUpdateUser.mockResolvedValue({ data: {}, error: null });
  mockSignOut.mockResolvedValue({ error: null });
});
/**
 * Test Suite for Form State Changes
 */
describe("AccountSettings - mode switching", () => {
  // Test 1 - Shows the new email address field in email reset form
  it("shows only the New Email Address field in email mode", async () => {
    const user = userEvent.setup();
    renderAccountSettings();

    await user.click(screen.getByRole("button", { name: /^email reset$/i }));

    expect(screen.getByLabelText(/new email address/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/enter password/i)).not.toBeInTheDocument();
  });
  // Test 2 - only shows the password fields in the password reset form
  it("shows only the password fields in password mode", async () => {
    const user = userEvent.setup();
    renderAccountSettings();

    await user.click(screen.getByRole("button", { name: /^password reset$/i }));

    expect(screen.getByLabelText(/confirm old password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/new email address/i),
    ).not.toBeInTheDocument();
  });
  // Test 3 - shows both email and password fields in the email password form
  it("shows email and password fields together in email_password mode", async () => {
    const user = userEvent.setup();
    renderAccountSettings();

    await user.click(
      screen.getByRole("button", { name: /email & password reset/i }),
    );

    expect(screen.getByLabelText(/new email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm old password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
  });

  // Test 4 - clears errors when active form is switched
  it("clears an error from a previous form when the active form changes", async () => {
    const user = userEvent.setup();
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });
    renderAccountSettings();

    await user.click(screen.getByRole("button", { name: /^password reset$/i }));
    await fillPasswordFields(user, {
      oldPassword: "WrongPass123!",
      newPassword: "ValidPass456!",
      confirmPassword: "ValidPass456!",
    });
    await user.click(screen.getByRole("button", { name: /submit changes/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^email reset$/i }));

    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
  });
});
/**
 * Test Suite for Password Reset Flow
 * On success, tests for redirect and sign out
 */
describe("AccountSettings - password reset flow", () => {
  // Test 1 - Blocks change when old password is invalid
  it("shows an error when the old password fails reauthentication", async () => {
    const user = userEvent.setup();
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });
    renderAccountSettings();

    await user.click(screen.getByRole("button", { name: /^password reset$/i }));
    await fillPasswordFields(user, {
      oldPassword: "WrongPass123!",
      newPassword: "ValidPass456!",
      confirmPassword: "ValidPass456!",
    });
    await user.click(screen.getByRole("button", { name: /submit changes/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  // Test 2 - Forces sign out and redirects after a successful password update
  it("forces a global sign-out and redirects after a successful password update", async () => {
    // Fake timers are needed here because the component delays navigate()
    // by 2 seconds after a successful password change. advanceTimers ties
    // userEvent's internal waits to the same fake clock so typing/clicking
    // still resolve correctly.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderAccountSettings();

    await user.click(screen.getByRole("button", { name: /^password reset$/i }));
    await fillPasswordFields(user, {
      oldPassword: "OldPass123!",
      newPassword: "ValidPass456!",
      confirmPassword: "ValidPass456!",
    });
    await user.click(screen.getByRole("button", { name: /submit changes/i }));

    expect(
      await screen.findByText(/success! password updated\./i),
      await screen.findByText(/redirecting to sign in \.\.\./i),
    ).toBeInTheDocument();
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: "ValidPass456!" });
    expect(mockSignOut).toHaveBeenCalledWith({ scope: "global" });

    await vi.advanceTimersByTimeAsync(2000);
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });

    vi.useRealTimers();
  });
});
/**
 * Email & Password Reset Flow
 * Tests for partial failures/successes
 */
describe("AccountSettings - email & password reset flow", () => {
  const fillEmailPasswordFields = async (
    user,
    { email, oldPassword, newPassword, confirmPassword },
  ) => {
    await user.type(screen.getByLabelText(/new email address/i), email);
    await fillPasswordFields(user, {
      oldPassword,
      newPassword,
      confirmPassword,
    });
  };

  // Test 1 - partial success displays success for password but error for email
  it("shows a partial-success message when the password updates but the email does not", async () => {
    const user = userEvent.setup();
    mockUpdateUser
      .mockResolvedValueOnce({ data: {}, error: null }) // password update succeeds
      .mockResolvedValueOnce({
        data: null,
        error: { message: "Email already registered" },
      }); // email update fails

    renderAccountSettings();

    await user.click(
      screen.getByRole("button", { name: /email & password reset/i }),
    );
    await fillEmailPasswordFields(user, {
      email: "taken@example.com",
      oldPassword: "OldPass123!",
      newPassword: "ValidPass456!",
      confirmPassword: "ValidPass456!",
    });
    await user.click(screen.getByRole("button", { name: /submit changes/i }));

    expect(await screen.findByText(/password updated!/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /error updating email address\. click email reset above/i,
      ),
    ).toBeInTheDocument();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  // Test 2 - full success message rendering with email and password update
  it("shows a full success message when both the password and email update", async () => {
    const user = userEvent.setup();
    mockUpdateUser
      .mockResolvedValueOnce({ data: {}, error: null }) // password update succeeds
      .mockResolvedValueOnce({ data: {}, error: null }); // email update succeeds

    renderAccountSettings();

    await user.click(
      screen.getByRole("button", { name: /email & password reset/i }),
    );
    await fillEmailPasswordFields(user, {
      email: "new@example.com",
      oldPassword: "OldPass123!",
      newPassword: "ValidPass456!",
      confirmPassword: "ValidPass456!",
    });
    await user.click(screen.getByRole("button", { name: /submit changes/i }));

    expect(
      await screen.findByText(/email and password have been updated/i),
    ).toBeInTheDocument();
    expect(mockUpdateUser).toHaveBeenNthCalledWith(1, {
      password: "ValidPass456!",
    });
    expect(mockUpdateUser).toHaveBeenNthCalledWith(2, {
      email: "new@example.com",
    });
    // No forced sign-out for the combined flow -- see reasoning in AccountSettings
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});

describe("AccountSettings - pending email banner", () => {
  it("renders the pending-change banner when user.new_email differs from user.email", () => {
    renderAccountSettings({ new_email: "pending@example.com" });

    expect(screen.getByText(/change pending/i)).toBeInTheDocument();
    expect(screen.getByText(/pending@example.com/i)).toBeInTheDocument();
  });

  it("does not render the pending-change banner when there is no pending email", () => {
    renderAccountSettings();

    expect(screen.queryByText(/change pending/i)).not.toBeInTheDocument();
  });
});
