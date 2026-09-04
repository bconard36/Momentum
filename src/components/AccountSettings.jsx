import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { supabase } from "../utils/supabaseClient";

// Account Settings
// Two buttons/areas - update password and update email
// Conditional rendering for each
// password update, success, fail
// email update, success, fail
// Supabase needs to be imported
// Redirect after

const AccountSettings = ({ user }) => {
  const navigate = useNavigate();

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

  // Capture authenticated user email data
  let userEmail = user?.email;

  // Password visibility state management
  const [showOriginalPassword, setShowOriginalPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showConfirmPasswordReset, setShowConfirmPasswordReset] =
    useState(false);

  // Reset Form State Management
  const [activeForm, setActiveForm] = useState(null); // null | 'email' | 'password' | 'all'

  // Reset Form Error/Success State Management
  const [formError, setFormError] = useState(null); // { form: 'email', message: '...' }
  const [formSuccess, setFormSuccess] = useState(null); // pending for button renering. desctructured for success { form: 'email', message: '...' }
  const [newEmail, setNewEmail] = useState(""); // State of updated email address to display in success window

  if (!user && !formSuccess) {
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

      if (activeForm === "email") {
        if (emailReset === userEmail) {
          // TODO - Error handling here
          setFormError({
            form: "email",
            message: "New email must be different from your current email.",
          });
          reset();
          return;
        }
        const { data: newEmail, error: emailResetError } =
          await supabase.auth.updateUser({
            email: emailReset,
          });

        if (emailResetError) {
          // TODO - Insert graceful error pop up here
          setFormError({
            form: "email",
            message: "Error updating email address.",
          });
          console.log("Error resetting email: ", emailResetError.message);
        } else {
          // TODO - success render here
          setFormError(null);
          setFormSuccess({
            form: "email",
            message: "Success! Your email has been updated.",
          });
          setNewEmail(emailReset);
          reset();
        }
      } else if (activeForm === "password") {
        const { error: reAuthError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: oldPassword,
        });
        // TODO - Error and Success handling here
        if (reAuthError) {
          setFormError({
            form: "password",
            message: "Invalid credentials.",
          });
        } else if (newPassword === oldPassword) {
          setFormError({
            form: "password",
            message:
              "New password must be different from your current password.",
          });
        } else if (newPassword !== confirmNewPassword) {
          setFormError({
            form: "password",
            message: "Passwords do not match.",
          });
        } else {
          const { data: newPass, error: newPassError } =
            await supabase.auth.updateUser({
              password: newPassword,
            });

          if (newPassError) {
            setFormError({
              form: "password",
              message: "Error updating password.",
            });
          } else {
            setFormError(null);
            setFormSuccess({
              form: "password",
              message: "Success! Your password has been updated!",
            });
            reset();
            await supabase.auth.signOut();
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 2000);
            return;
          }
        }
      } else if (activeForm === "email_password") {
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
            email: userEmail,
            password: oldPassword,
          });
        // Handle credential errors
        if (emailPassError) {
          setFormError({
            form: "email_password",
            message: "Invalid Credentials.",
          });
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
            setFormError({
              form: "email_password",
              message: "Error updating password.",
            });
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
              setFormError({
                form: "email_password",
                message:
                  "Password updated, but email was not. Please try updating your email again.",
              });
              console.log(`Error updating email: ${emailUpdateError}`);
              // Set emailUpdateError(true) state here
              reset();
              return;
            } else {
              setNewEmail(emailReset);
              setFormSuccess({
                form: "email_password",
                message: `Success! Email and password have been updated! Be sure to watch out for a confirmation email at ${userEmail}`,
              });
              // await supabase.auth.signOut();
              // setTimeout(() => {
              //   navigate("/sign-in", { replace: true });
              // }, 2000);
              // reset();
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
            setActiveForm("email");
            setFormError(null);
            setFormSuccess("pending");
            reset();
          }}
        >
          Email Reset
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setActiveForm("password");
            setFormError(null);
            setFormSuccess("pending");
            reset();
          }}
        >
          Password Reset
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setActiveForm("email_password");
            setFormError(null);
            setFormSuccess("pending");
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
          {formError?.form === activeForm && (
            <div className="reset-overlay">
              <div className="reset-message-container">
                <span className="reset-error-message">
                  {formError?.message}
                </span>
                <span>Please try again</span>
              </div>
            </div>
          )}
          {formSuccess?.form === activeForm && activeForm === "email" && (
            <div className="reset-overlay">
              <div className="reset-message-container">
                <span className="reset-success-message">
                  Success! Your email has been updated.
                </span>
                <span className="reset-success-note">
                  A confirmation email has been sent to {newEmail}.
                </span>
                <Link to="/dashboard" className="password-success-link">
                  <button
                    type="button"
                    className="primary-button password-reset-success-button"
                  >
                    Return to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          )}
          {formSuccess?.form === activeForm && activeForm === "password" && (
            <div className="reset-overlay">
              <div className="reset-message-container">
                <span className="reset-success-message">
                  Success! Password Updated.
                </span>
                <span className="reset-success-note">
                  Redirecting to sign in ...
                </span>
              </div>
            </div>
          )}

          {activeForm === "email" && formSuccess === "pending" && (
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
          {activeForm === "password" && formSuccess === "pending" && (
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
          {activeForm === "email_password" && (
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
          {(activeForm === "email" ||
            activeForm === "password" ||
            activeForm === "email_password") &&
            (formSuccess === "pending" || formSuccess === null) && (
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
