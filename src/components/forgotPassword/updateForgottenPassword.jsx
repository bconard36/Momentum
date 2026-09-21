import { useForm } from "react-hook-form";
import PasswordInput from "../PasswordInput";
import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Link, useNavigate } from "react-router";
/**
 * Update Forgotten Password Component
 *
 * Step 2 of the 2-part password reset process. Reached via the link
 * Supabase emails to the user after ForgotPassword submits a reset
 * request (see redirectTo in ForgotPassword's onSubmit).
 *
 * NOTE: Currently a UI/state scaffold only. The actual
 * supabase.auth.updateUser() call is stubbed out below and not yet wired in.
 * Supabase's password-recovery link establishes a temporary authenticated
 * session on redirect, which updateUser() will rely on once implemented —
 * this component does not yet accept or validate a reset token directly.
 *
 * UI states (mutually exclusive):
 *  - Default: renders the new-password form
 *  - formSuccess: confirmation message, auto-redirects to /sign-in after 3s
 *  - formError: failure message with a link back to ForgotPassword to retry
 *
 * @returns {JSX.Element} New password entry form with success/error states
 */
const UpdateForgottenPassword = () => {
  // Shows the success confirmation and triggers the delayed redirect
  const [formSuccess, setFormSuccess] = useState(false);
  // Holds the error to display; same { name, message } shape as the
  // account settings form, for consistency across the app's error states
  const [formError, setFormError] = useState(null);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      update_forgotten_password: "",
      confirm_forgotten_password_update: "",
    },
  });

  /**
   * Handles submission of the new password.
   *
   * TODO: currently a placeholder — logs the intended new password instead
   * of calling Supabase. The commented block below is the planned
   * supabase.auth.updateUser() call to wire in once ready.
   *
   * Intended flow once implemented:
   *  1. Call supabase.auth.updateUser({ password }) using the session
   *     established by the recovery link redirect.
   *  2. On success: show the success state and redirect to /sign-in.
   *  3. On failure: set formError and show the error state instead.
   *
   * @param {{ update_forgotten_password: string, confirm_forgotten_password_update: string }} data
   *   Form values from react-hook-form. The confirm field is validated
   *   against update_forgotten_password via PasswordInput's matchValue prop.
   * @returns {Promise<void>}
   */
  const onSubmit = async (data) => {
    try {
      console.log(
        `Call supabase.auth.updateUser() with password to set as new: ${data.update_forgotten_password}`,
      );
      // Attempt to update password
      //   const { data: passwordReset, error: passwordResetError } =
      //     await supabase.auth.updateUser({
      //       password: passwordReset,
      //     });

      //   if (passwordResetError) {
      //     console.log(`Error updating password: ${passwordResetError.message}`);
      //   } else {
      //     console.log(
      //       `Success — password updated. New password: ${passwordReset}`,
      //     );
      //   }
      // Placeholder success path until the real call above is wired in
      setFormSuccess(true);
      setFormError(null);
      setTimeout(() => {
        navigate("/sign-in", { replace: true });
      }, 3000);
    } catch (error) {
      console.error(`Error updating password: ${error}`);
    }
  };

  return (
    <div className="update-forgotten-password-container">
      {/* Success state — confirms the update and auto-redirects to sign in */}
      {formSuccess && (
        <div className="forgotten-password-reset-success">
          <h2>Success!</h2>
          <h4>Your password has been reset.</h4>
          <p>Redirecting to sign in...</p>
          <p className="manual-redirect-container">
            If page does not automatically refresh after 10 seconds,{" "}
            <Link to="/sign-in" className="manual-redirect">
              click here
            </Link>
            .
          </p>
        </div>
      )}
      {/* Error state — shown if the (future) update call fails */}
      {!formSuccess && formError !== null && (
        <div className="forgotten-password-reset-failure">
          <span className="error-message">Error updating password.</span>
          <p>{formError}</p>
          <Link to="/forgot-password" className="password-reset-error-redirect">
            Please try again
          </Link>
        </div>
      )}
      {/* Default state — new password entry form */}
      {!formSuccess && formError === null && (
        <>
          <h2>Update Your Password</h2>
          <form
            className="update-forgotten-password-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="update-forgotten-password-field">
              <PasswordInput
                register={register}
                label="update_forgotten_password"
                name="update_forgotten_password"
                id="update_forgotten_password"
                errors={errors}
              />
            </div>
            <div className="update-forgotten-password-field">
              <PasswordInput
                register={register}
                label="confirm_forgotten_password_update"
                name="confirm_forgotten_password_update"
                id="confirm_forgotten_password_update"
                errors={errors}
                matchValue={watch("update_forgotten_password")}
              />
            </div>
            <button className="primary-button update-forgotten-password-button">
              Update Password
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default UpdateForgottenPassword;
