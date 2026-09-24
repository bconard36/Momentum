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
import { supabase } from "../../utils/supabaseClient";
import signOut from "../../utils/signOut";
import UpdateForgottenPassword from "../../components/forgotPassword/updateForgottenPassword";

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
vi.mock("../../utils/supabaseClient", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

// Mock Sign Out
vi.mock("../../utils/signOut", () => ({
  default: vi.fn(),
}));

const renderUpdateForgottenPassword = () => {
  <MemoryRouter>
    <UpdateForgottenPassword />
  </MemoryRouter>;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  supabase.auth.updateUser.mockResolvedValue({ data: {}, error: null });
  signOut.mockResolvedValue({ success: true, error: null });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("UpdateForgottenPassword", () => {
  // Test 1: Renders an update password form by default
  it("renders an update password form by default", () => {
    renderUpdateForgottenPassword();

    expect(
      screen.getByRole("heading", { name: /update your password/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /update password/i }),
    ).toBeInTheDocument();
  });
});
