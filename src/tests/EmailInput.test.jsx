/**
 * EmailInput.test.jsx
 * Unit tests for the reusable EmailInput component.
 *
 * EmailInput relies on react-hook-form's `register`, which only works
 * inside an active useForm() context. TestForm recreates that context
 * the same way AccountSettings does in production.
 *
 * Coverage:
 *  - Renders "Email Address" label by default, "New Email Address" for email_reset
 *  - Shows required error on empty submit
 *  - Shows invalid-format error on malformed input
 *  - Calls onSubmit with the typed value when valid
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import EmailInput from "../components/EmailInput";
/**
 * Test Form to Render
 * @param {Object} Form - deconstructed form object
 * @returns
 */
const TestForm = ({ name = "email", onSubmit = vi.fn() }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <EmailInput
        register={register}
        type="email"
        name={name}
        id={name}
        errors={errors}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

describe("EmailInput", () => {
  // Test 1 & 2 - Label-specific name rendering
  it("renders the generic label for the non-reset field name", () => {
    render(<TestForm name="email" />);
    expect(screen.getByLabelText(/^Email Address$/i)).toBeInTheDocument();
  });

  it("renders the reset-specific label for email_reset", () => {
    render(<TestForm name="email_reset" />);
    expect(screen.getByLabelText(/New Email Address/i)).toBeInTheDocument();
  });

  // Test 3 - prevents empty email submission
  it("shows a required error when submitted empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm name="email" onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText(/email address is required/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Test 4 - shows invalid message for improper formatting
  it("shows an invalid-format error for a malformed email", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm name="email" onSubmit={onSubmit} />);

    await user.type(
      screen.getByLabelText(/^Email Address$/i),
      "notavalidemail@doesntmatterhere",
    );
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText(/invalid email address/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Test 5 - calls onSubmit with typed value when the email is valid
  it("calls onSubmit with the typed value when the email is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TestForm name="email" onSubmit={onSubmit} />);

    await user.type(
      screen.getByLabelText(/^Email Address$/i),
      "test@example.com",
    );
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@example.com" }),
      expect.anything(),
    );
  });
});
