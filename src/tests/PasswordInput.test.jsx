/**
 * PasswordInput.test.jsx
 * Unit tests for the reusable PasswordInput component.
 *
 * Coverage:
 *  - Correct label for each label variant (old password, confirm, new)
 *  - Show/hide password toggle switches input type
 *  - Strong password rules apply for new-password fields
 *  - Lightweight "required only" rule applies when isCurrentPassword is true
 *  - Cross-field match validation fires when matchValue is provided
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import PasswordInput from "../components/PasswordInput";

const TestForm = ({
  label,
  name = "password_reset",
  isCurrentPassword,
  onSubmit = vi.fn(),
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { [name]: "" } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PasswordInput
        register={register}
        label={label}
        name={name}
        id={name}
        errors={errors}
        isCurrentPassword={isCurrentPassword}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

const MatchTestForm = ({ onSubmit = vi.fn() }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password_reset: "", confirm_password_reset: "" },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PasswordInput
        register={register}
        label="password_reset"
        name="password_reset"
        id="password_reset"
        errors={errors}
      />
      <PasswordInput
        register={register}
        label="confirm_password_reset"
        name="confirm_password_reset"
        id="confirm_password_reset"
        errors={errors}
        matchValue={watch("password_reset")}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

describe("PasswordInput", () => {
  // Test 1 - renders "Confirm Old Password" for the password_original label
  it("renders 'Confirm Old Password' for the password_original label", () => {
    render(
      <TestForm
        label="password_original"
        name="password_original"
        isCurrentPassword
      />,
    );
    expect(screen.getByLabelText(/Confirm Old Password/i)).toBeInTheDocument();
  });
  // Test 2 - renders "Confirm Password" for the confirm_password_reset label
  it("renders 'Confirm Password' for confirm_password_reset", () => {
    render(
      <TestForm label="confirm_password_reset" name="confirm_password_reset" />,
    );
    expect(screen.getByLabelText(/^Confirm Password$/i)).toBeInTheDocument();
  });
  // Test 3 - renders "Enter Password" for the password_reset label
  it("renders 'Enter Password' for a new-password field", () => {
    render(<TestForm label="password_reset" name="password_reset" />);
    expect(screen.getByLabelText(/Enter Password/i)).toBeInTheDocument();
  });
  // Test 4 - toggles between password and text when icon is clicked
  it("toggles input type between password and text when the icon is clicked", async () => {
    const user = userEvent.setup();
    render(<TestForm label="password_reset" name="password_reset" />);
    const input = screen.getByLabelText(/Enter Password/i);
    expect(input).toHaveAttribute("type", "password");

    const toggle = document.querySelector(".password-reset-toggle");
    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
  });
  // Test 5 - Enforces new password specific password rules
  it("enforces the strong password rules on a new-password field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TestForm
        label="password_reset"
        name="password_reset"
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText(/Enter Password/i), "short");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText(/at least 12 characters/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  // Test 6 - Enforces current password specific password rules
  it("does not enforce the strength pattern on the current-password field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TestForm
        label="password_original"
        name="password_original"
        isCurrentPassword
        onSubmit={onSubmit}
      />,
    );

    // Deliberately weak by the "strong" ruleset: short, no symbol, no number
    await user.type(screen.getByLabelText(/Confirm Old Password/i), "weakpass");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ password_original: "weakpass" }),
      expect.anything(),
    );
  });
  // Test 7 - Prevents empty field form submission
  it("shows a required error when the current-password field is submitted empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TestForm
        label="password_original"
        name="password_original"
        isCurrentPassword
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText(/current password is required/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  // Test 8 - Password and confirm password matching validation
  it("shows a mismatch error when the confirm field differs from the new password", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MatchTestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Enter Password/i), "ValidPass123!");
    await user.type(
      screen.getByLabelText(/^Confirm Password$/i),
      "DifferentPass123!",
    );
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Test 9 - Successfull submission when confirm field matches and all other requirements are met
  it("submits successfully when the confirm field matches", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MatchTestForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Enter Password/i), "ValidPass123!");
    await user.type(
      screen.getByLabelText(/^Confirm Password$/i),
      "ValidPass123!",
    );
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        password_reset: "ValidPass123!",
        confirm_password_reset: "ValidPass123!",
      }),
      expect.anything(),
    );
  });
});
