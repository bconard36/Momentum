import { useForm } from "react-hook-form";
import PasswordInput from "../PasswordInput";
import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import signOut from "../../hooks/signOut";
import { Link, useNavigate } from "react-router";
/**
 * Update Forgotten Password Component
 *
 * Step 2 of the 2-part password reset process. Reached via the link
 * Supabase emails to the user after ForgotPassword submits a reset
 * request (see redirectTo in ForgotPassword's onSubmit).
 *
 * The recovery link establishes an authenticated recovery session,
 * which allows supabase.auth.updateUser() to update the user's password.
 * After a successful password update, the user is signed out of the recovery
 * session and redirected to the sign-in route.
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
   * Flow:
   *  1. Update the user's password using the authenticated recovery session.
   *  2. Sign out of the recovery session.
   *  3. On successful sign-out, show the success state and redirect to /sign-in.
   *  4. If either operation fails, set formError and display the error state.
   *
   * @param {{ update_forgotten_password: string, confirm_forgotten_password_update: string }} data
   *   Form values from react-hook-form. The confirm field is validated
   *   against update_forgotten_password via PasswordInput's matchValue prop.
   * @returns {Promise<void>}
   */
  const onSubmit = async (data) => {
    try {
      const passwordReset = data.confirm_forgotten_password_update;
      // Attempt to update password
      const { error: passwordResetError } = await supabase.auth.updateUser({
        password: passwordReset,
      });

      if (passwordResetError) {
        setFormError({
          form: "password_recovery",
          message: "Unexpected error occurred.",
        });
      } else {
        // Wait for the signOut method to clear session data
        const { success, error } = await signOut();

        // If signOut successful, handle password reset redirect flow
        if (success) {
          setFormSuccess(true);
          setFormError(null);
          setTimeout(() => {
            navigate("/sign-in", { replace: true });
          }, 3000);
        } else {
          setFormError({
            form: "password_recovery",
            message: `${error.message}`,
          });
        }
      }
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
      {/* Error state — shown if password update or sign-out fails */}
      {!formSuccess && formError !== null && (
        <div className="forgotten-password-reset-failure">
          <span className="error-message">Error updating password.</span>
          <p>{formError.message}</p>
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
