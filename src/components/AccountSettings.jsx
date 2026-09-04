import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { supabase } from "../utils/supabaseClient";

// Account Settings
// Two buttons/areas - update password and update email
// Conditional rendering for each
// password update, success, fail
// email update, success, fail
// Supabase needs to be imported
// Redirect after

const AccountSettings = ({ user }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email_reset: "",
      password_original: "",
      password_reset: "",
      confirm_password_reset: "",
    },
  });

  const originalEmail = user?.email;

  // Password visibility state management
  const [showOriginalPassword, setShowOriginalPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showConfirmPasswordReset, setShowConfirmPasswordReset] =
    useState(false);

  // Reset Form State Management
  const [resetEmail, setResetEmail] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [resetAll, setResetAll] = useState(false);

  // Reset Form Error/Success State Management
  const [emailResetSuccess, setEmailResetSuccess] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  if (!user) {
    return (
      <div className="loading-message-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }
  /**
   * Handles submission for email and password updates
   * Conditionally handles email, password, and email and password updates.
   * Confirm Password used as extra security measure
   * Original email captured and used with confirm password to confirm authticated user before making password updates
   * @param {Object<FormData>} data - user email and/or password update data
   * @returns void
   */
  const onSubmit = async (data) => {
    try {
      const emailReset = data.email_reset;
      const oldPassword = data.password_original;
      const newPassword = data.password_reset;
      const confirmNewPassword = data.confirm_password_reset;

      if (resetEmail) {
        if (emailReset === originalEmail) {
          // TODO - Error handling here
          setEmailError(true);
          reset();
          return;
        }
        const { data: newEmail, error: emailResetError } =
          await supabase.auth.updateUser({
            email: emailReset,
          });

        if (emailResetError) {
          // TODO - Insert graceful error pop up here
          setEmailError(true);
          console.log("Error resetting email: ", emailResetError.message);
        } else {
          // TODO - success render here
          setEmailError(false);
          setEmailResetSuccess(true);
          reset();
        }
      } else if (resetPassword) {
        const { error: reAuthError } = await supabase.auth.signInWithPassword({
          email: originalEmail,
          password: oldPassword,
        });
        // TODO - Error and Success handling here
        if (reAuthError) {
          console.log(`Invalid credentials. Please try again.`);
          reset();
          return;
        } else if (newPassword === oldPassword) {
          console.log(
            "New password must be different from your current password.",
          );
        } else if (newPassword !== confirmNewPassword) {
          console.log("Passwords do not match");
        } else {
          const { data: newPass, error: newPassError } =
            await supabase.auth.updateUser({
              password: newPassword,
            });

          if (newPassError) {
            console.log(`Error updating password: ${newPassError.message}`);
          } else {
            console.log(`Password updated!`);
            reset();
            return;
          }
        }
      } else if (resetAll) {
        // Check client side first
        // Return on all errors throughout this block
        if (newPassword !== confirmNewPassword) {
          console.log("Passwords do not match.");
          reset();
          return;
        }

        if (newPassword === oldPassword) {
          console.log(
            "New password must be different from your current password.",
          );
          reset();
          return;
        }
        // Reverify old password
        const { error: emailPassError } =
          await supabase.auth.signInWithPassword({
            email: originalEmail,
            password: oldPassword,
          });
        // Handle credential errors
        if (emailPassError) {
          console.log(`Invalid Credentials: ${emailPassError.message}`);
          reset();
          return;
        } else {
          // Attempt to update password
          const { data: passwordUpdate, error: passwordUpdateError } =
            await supabase.auth.updateUser({
              password: newPassword,
            });
          // Handle success/errors
          if (passwordUpdateError) {
            // Set passwordUpdateError(true) state here
            console.log(
              `Error updating password: ${passwordUpdateError.message}`,
            );
            reset();
            return;
          } else {
            // TODO - State management for password update success for partial failure/success
            console.log(`Success! Password Updated`);
            // Once password updated, update email
            const { data: emailUpdate, error: emailUpdateError } =
              await supabase.auth.updateUser({
                email: emailReset,
              });
            if (emailUpdateError) {
              console.log(`Error updating email: ${emailUpdateError}`);
              // Set emailUpdateError(true) state here
              reset();
              return;
            } else {
              console.log(`Success! Email Updated!`);
              reset();
            }
          }
        }
        console.log(`Email and password both updated successfully.`);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  return (
    <>
      <div className="return-container">
        <Link to="/dashboard" className="return-link" id="workout-return">
          Return to Dashboard
        </Link>
      </div>
      <div className="account-settings-header-container">
        <h1>User Account Settings</h1>
      </div>
      <div className="form-to-render-container">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setResetEmail(true);
            setResetPassword(false);
            setResetAll(false);
            reset();
          }}
        >
          Email Reset
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setResetPassword(true);
            setResetEmail(false);
            setResetAll(false);
            reset();
          }}
        >
          Password Reset
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setResetAll(true);
            setResetEmail(false);
            setResetPassword(false);
            reset();
          }}
        >
          Email & Password Reset
        </button>
      </div>

      <div className="account-settings-form-container">
        <form
          className="account-settings-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {emailError && (
            <div className="reset-error-overlay">
              <div className="reset-error-container">
                <span className="reset-error-message">
                  Error updating email address.
                </span>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    reset();
                    setEmailError(false);
                    setResetEmail(true);
                  }}
                >
                  Please try again.
                </button>
              </div>
            </div>
          )}

          {resetEmail && !resetPassword && !resetAll && !emailError && (
            <div className="account-settings-form-group">
              <label htmlFor="email-reset">New Email Address</label>
              {errors.email_reset && (
                <span className="error-message">
                  {errors.email_reset.message}
                </span>
              )}
              <input
                type="email"
                name="email_reset"
                id="email_reset"
                {...register("email_reset", {
                  required: "New email address is required.",
                })}
              />
            </div>
          )}
          {resetPassword && !resetEmail && !resetAll && (
            <>
              <div className="account-settings-form-group">
                <label htmlFor="password_original">Confirm Old Password</label>
                {errors.password_original && (
                  <span className="error-message">
                    {errors.password_original.message}
                  </span>
                )}
                <input
                  type={showOriginalPassword ? "text" : "password"}
                  name="password_original"
                  id="password_original"
                  {...register("password_original", {
                    required: "Original password is required.",
                  })}
                />
                <svg
                  width="50px"
                  height="50px"
                  viewBox="-0.5 0 25 25"
                  style={{
                    fill: "currentColor",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  className="original-password-toggle"
                  onClick={() => setShowOriginalPassword(!showOriginalPassword)}
                >
                  <path
                    d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                    stroke="#FFF"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="account-settings-form-group">
                <label htmlFor="password_reset">New Password</label>
                {errors.password_reset && (
                  <span className="error-message">
                    {errors.password_reset.message}
                  </span>
                )}
                <input
                  type={showPasswordReset ? "text" : "password"}
                  name="password_reset"
                  id="password_reset"
                  {...register("password_reset", {
                    required: "New password is required.",
                  })}
                />
                <svg
                  width="50px"
                  height="50px"
                  viewBox="-0.5 0 25 25"
                  style={{
                    fill: "currentColor",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  className="password-reset-toggle"
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                >
                  <path
                    d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                    stroke="#FFF"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="account-settings-form-group">
                <label htmlFor="confirm_password_reset">
                  Confirm New Password
                </label>
                {errors.confirm_password_reset && (
                  <span className="error-message">
                    {errors.confirm_password_reset.message}
                  </span>
                )}
                <input
                  type={showConfirmPasswordReset ? "text" : "password"}
                  name="confirm_password_reset"
                  id="confirm_password_reset"
                  {...register("confirm_password_reset", {
                    required: "Please confirm your new password.",
                  })}
                />
                <svg
                  width="50px"
                  height="50px"
                  viewBox="-0.5 0 25 25"
                  style={{
                    fill: "currentColor",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  className="confirm-password-reset-toggle"
                  onClick={() =>
                    setShowConfirmPasswordReset(!showConfirmPasswordReset)
                  }
                >
                  <path
                    d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                    stroke="#FFF"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </>
          )}
          {resetAll && !resetEmail && !resetPassword && (
            <>
              <div className="account-settings-form-group">
                <label htmlFor="email-reset">New Email Address</label>
                {errors.email_reset && (
                  <span className="error-message">
                    {errors.email_reset.message}
                  </span>
                )}
                <input
                  type="email"
                  name="email_reset"
                  id="email_reset"
                  {...register("email_reset", {
                    required: "New email address is required.",
                  })}
                />
              </div>
              <div className="account-settings-form-group">
                <label htmlFor="password_original">Confirm Old Password</label>
                {errors.password_original && (
                  <span className="error-message">
                    {errors.password_original.message}
                  </span>
                )}
                <input
                  type={showOriginalPassword ? "text" : "password"}
                  name="password_original"
                  id="password_original"
                  {...register("password_original", {
                    required: "Original password is required.",
                  })}
                />
                <svg
                  width="50px"
                  height="50px"
                  viewBox="-0.5 0 25 25"
                  style={{
                    fill: "currentColor",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  className="original-password-toggle"
                  onClick={() => setShowOriginalPassword(!showOriginalPassword)}
                >
                  <path
                    d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                    stroke="#FFF"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="account-settings-form-group">
                <label htmlFor="password_reset">New Password</label>
                {errors.password_reset && (
                  <span className="error-message">
                    {errors.password_reset.message}
                  </span>
                )}
                <input
                  type={showPasswordReset ? "text" : "password"}
                  name="password_reset"
                  id="password_reset"
                  {...register("password_reset", {
                    required: "New password is required.",
                  })}
                />
                <svg
                  width="50px"
                  height="50px"
                  viewBox="-0.5 0 25 25"
                  style={{
                    fill: "currentColor",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  className="password-reset-toggle"
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                >
                  <path
                    d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                    stroke="#FFF"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="account-settings-form-group">
                <label htmlFor="confirm_password_reset">
                  Confirm New Password
                </label>
                {errors.confirm_password_reset && (
                  <span className="error-message">
                    {errors.confirm_password_reset.message}
                  </span>
                )}
                <input
                  type={showConfirmPasswordReset ? "text" : "password"}
                  name="confirm_password_reset"
                  id="confirm_password_reset"
                  {...register("confirm_password_reset", {
                    required: "Please confirm your new password.",
                  })}
                />
                <svg
                  width="50px"
                  height="50px"
                  viewBox="-0.5 0 25 25"
                  style={{
                    fill: "currentColor",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  className="confirm-password-reset-toggle"
                  onClick={() =>
                    setShowConfirmPasswordReset(!showConfirmPasswordReset)
                  }
                >
                  <path
                    d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                    stroke="#FFF"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                    stroke="#000"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </>
          )}
          {!emailError && !passwordError && (
            <div className="account-settings-form-actions">
              <button
                type="submit"
                className="primary-button account-settings-submit"
              >
                Submit Changes
              </button>
              <button
                type="reset"
                className="secondary-button account-settings-reset"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default AccountSettings;
