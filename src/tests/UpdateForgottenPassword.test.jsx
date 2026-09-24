/**
 * UpdateForgottenPassword.test.jsx
 * Unit tests for the UpdateForgottenPassword component.
 *
 * Coverage:
 * - Renders the new-password form by default
 * - Successful password update: calls updateUser, signs out, shows success
 *   state, and navigates to /sign-in after the 3s delay
 * - updateUser failure: shows the generic error state, does not call signOut
 * - signOut failure (after a successful updateUser): shows the specific
 *   error message returned by signOut
 * - Mismatched passwords: updateUser is never called (delegates the actual
 *   "do these match" messaging to PasswordInput's own test suite)
 *
 * Not covered (intentionally deferred):
 * - PasswordInput's own field-level validation messaging — see PasswordInput.test.jsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router";
import { supabase } from "../utils/supabaseClient";
import signOut from "../utils/signOut";
import UpdateForgottenPassword from "../components/forgotPassword/updateForgottenPassword";

// Navigation Mock
const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Mock supabase.auth.updateUser()
vi.mock("../utils/supabaseClient", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

// Mock Sign Out
vi.mock("../utils/signOut", () => ({
  default: vi.fn(),
}));

// Container is needed here to mock the password recovery route protections
const renderUpdateForgottenPassword = () => {
  const { container } = render(
    <MemoryRouter>
      <UpdateForgottenPassword />
    </MemoryRouter>,
  );

  return container;
};

// Fill both password fields by ID - sidesteps depending on PasswordInputs dynamic label text
const fillPasswords = async (user, container, newPassword, confirmPassword) => {
  await user.type(
    container.querySelector("#update_forgotten_password"),
    newPassword,
  );
  await user.type(
    container.querySelector("#confirm_forgotten_password_update"),
    confirmPassword,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  supabase.auth.updateUser.mockResolvedValue({ data: {}, error: null });
  signOut.mockResolvedValue({ success: true, error: null });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("UpdateForgottenPassword", () => {
  // Test 1: Renders an update password form by default
  it("renders an update password form by default", () => {
    const container = renderUpdateForgottenPassword();
    expect(
      screen.getByRole("heading", { name: /update your password/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector("#update_forgotten_password"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("#confirm_forgotten_password_update"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update password/i }),
    ).toBeInTheDocument();
  });

  // Test 2: updates the password, signs out, shows success, and navigates to /sign-in after the delay
  it("updates the password, signs out, shows success, and navigates to /sign-in after the delay", async () => {
    const user = userEvent.setup();
    const container = renderUpdateForgottenPassword();

    await fillPasswords(user, container, "NewPassword12!!", "NewPassword12!!");

    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText(/success!/i)).toBeInTheDocument();

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: "NewPassword12!!",
    });
    expect(signOut).toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();

    await vi.waitFor(
      () => {
        expect(navigateMock).toHaveBeenCalledWith("/sign-in", {
          replace: true,
        });
      },
      { timeout: 3500 },
    );
  }, 4000); // bump this test's own timeout past the 3s delay + margin
});
// Test 3: shows a generic error and does not sign out when updateUser fails
it("shows a generic error and does not sign out when updateUser fails", async () => {
  supabase.auth.updateUser.mockResolvedValueOnce({
    data: null,
    error: { message: "Auth session missing!" },
  });

  const user = userEvent.setup();
  const container = renderUpdateForgottenPassword();

  await fillPasswords(user, container, "NewPassword12!!", "NewPassword12!!");
  await user.click(screen.getByRole("button", { name: /update password/i }));

  expect(
    await screen.findByText(/unexpected error occurred\./i),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /please try again/i }),
  ).toHaveAttribute("href", "/forgot-password");

  expect(signOut).not.toHaveBeenCalled();
  expect(navigateMock).not.toHaveBeenCalled();
});

// Test 4: shows signOut's error message when updateUser succeeds but signOut fails
it("shows signOut's error message when updateUser succeeds but signOut fails", async () => {
  signOut.mockResolvedValueOnce({
    success: false,
    error: { message: "Unable to sign out." },
  });

  const user = userEvent.setup();
  const container = renderUpdateForgottenPassword();

  await fillPasswords(user, container, "NewPassword12!!", "NewPassword12!!");
  await user.click(screen.getByRole("button", { name: /update password/i }));

  expect(await screen.findByText(/unable to sign out\./i)).toBeInTheDocument();
  expect(navigateMock).not.toHaveBeenCalled();
});

// Test 5: does not call updateUser when the passwords do not match
it("does not call updateUser when the passwords do not match", async () => {
  const user = userEvent.setup();
  const container = renderUpdateForgottenPassword();

  await fillPasswords(user, container, "NewPassword12!!", "DoesNotMatch!!");
  await user.click(screen.getByRole("button", { name: /update password/i }));

  expect(supabase.auth.updateUser).not.toHaveBeenCalled();
});
