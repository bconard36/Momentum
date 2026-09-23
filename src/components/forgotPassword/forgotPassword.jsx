import { useForm } from "react-hook-form";
import { Link } from "react-router";
import EmailInput from "../EmailInput";
import { supabase } from "../../utils/supabaseClient";
import { useState } from "react";
/**
 * Forgot Password Component
 * Step 1 of the 2-part password-reset process — email verification
 * Renders a single email input; on submission, requests a Supabase password reset email vai `resetPasswordForEmail()`
 *
 * Step 2 (setting up the new password) is handled separately in UpdateForgottenPassword,
 * which the user reaches via the link Supabase sends to the submitted email address.
 *
 * UI states (mutually exclusive):
 *  - Default: renders the email form
 *  - showConfirm: renders a generic "check your email" confirmation
 *  - showError: renders a generic failure message with a retry option
 *
 * @returns {JSXElement} - Forgotten password email verification form
 */
const ForgotPassword = () => {
  // Controls which of the 3 UI states are shown
  const [showConfirm, setShowConfirm] = useState(false);
  const [showError, setShowError] = useState(false);

  // Stores submitted email purely for display in the confirmation message
  const [displayEmail, setDisplayEmail] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      forgot_password_email: "",
    },
  });

  /**
   * Handles submission of email address for resetting a forgotten password
   * Calls supabase.auth.resetPasswordForEmail with the submitted address
   * Intentionally returns a success-shaped response regardless of whether the email belongs
   * to a real account.
   *
   * On success: shows the confirmation message and resets the form
   * On failure (e.g. network/Supabase-side error) shows generic error state
   * @param {{ forgot_password_email: string }} data - form value
   */
  const onSubmit = async (data) => {
    try {
      // redirectTo must be pre-approved in the Supabase dashboard's
      // Redirect URLs list, or the generated email link will fail
      const userEmail = data.forgot_password_email;
      const { data: emailRecipient, error } =
        await supabase.auth.resetPasswordForEmail(userEmail, {
          redirectTo: `${window.location.origin}/update-forgotten-password`,
        });
      if (error) {
        setShowError(true);
        setShowConfirm(false);
        throw error;
      } else {
        setShowConfirm(true);
        setDisplayEmail(userEmail);
        reset();
      }
    } catch (err) {
      console.error(err.message || "An error occurred.");
    }
  };

  return (
    <>
      <div className="return-container">
        <Link to="/sign-in" className="return-link" id="forgot-password-return">
          Return to Sign In
        </Link>
      </div>
      {/* Error state — shown only if Supabase itself failed (not "account not found") */}
      {showError && (
        <div className="forgot-password-email-failure">
          <div className="email-failure-content">
            <p>Unable to send a verification email. Please try again.</p>
            <button
              className="secondary-button"
              onClick={() => setShowError(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Confirmation state — shown after any non-error submission, real account or not */}
      {showConfirm && !showError && (
        <div className="forgot-password-email-confirm">
          <div className="email-confirm-content">
            <p>
              If an account is associated with this email ({displayEmail}), you
              will receive a password reset link shortly. Please check your
              inbox and spam folders.
            </p>
            <button
              className="secondary-button"
              onClick={() => setShowConfirm(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Default state — the email request form itself */}
      {!showConfirm && !showError && (
        <>
          <div className="forgot-password-form-container">
            <h2>Forgot Password Email Verification</h2>
            <p>Please enter the email address associated with your account.</p>
            <form
              className="forgot-password-form"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="password-reset-form-group">
                <EmailInput
                  register={register}
                  type="email"
                  name="forgot_password_email"
                  id="forgot_password_email"
                  errors={errors}
                />
              </div>
              <button className="secondary-button forgot-password-button">
                Request Password Reset Email
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default ForgotPassword;
