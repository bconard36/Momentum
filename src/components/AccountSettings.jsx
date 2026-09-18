import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { supabase } from "../utils/supabaseClient";
import PasswordInput from "./PasswordInput";
import EmailInput from "./EmailInput";

/**
 * Account Settings Component
 * Allows authenticated users to update their email, password, or both
 * @param {Object} user - authenticated user  
 * @returns {JSXElement} account settings component with conditional form rendering
 */

const AccountSettings = ({ user }) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
  const userEmail = user?.email;
  const emailUpdatePending = !!user?.new_email && user.new_email !== user.email;

  // Reset Form State Management
  const [activeForm, setActiveForm] = useState(null); // null | 'email' | 'password' | 'email_password'

  // Reset Form Error/Success State Management
  const [formError, setFormError] = useState(null); // { form: 'email', message: '...' }
  const [formSuccess, setFormSuccess] = useState(null); // pending for button rendering. desctructured for success { form: 'email', message: '...' }
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
        const { data: emailUpdateResult, error: emailResetError } =
          await supabase.auth.updateUser({
            email: emailReset,
          });

        if (emailResetError) {
          // TODO - Insert graceful error pop up here
          setFormError({
            form: "email",
            message: "Error updating email address. Please try again.",
          });
        } else {
          setFormError(null);
          setNewEmail(emailReset);
          setFormSuccess({
            form: "email",
            message: `A confirmation email has been sent to ${emailReset}.`,
          });

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
          reset();
        } else if (newPassword === oldPassword) {
          setFormError({
            form: "password",
            message:
              "New password must be different from your current password.",
          });
          reset();
        } else if (newPassword !== confirmNewPassword) {
          setFormError({
            form: "password",
            message: "Passwords do not match.",
          });
          reset();
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
            await supabase.auth.signOut({ scope: "global" });
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 2000);
            return;
          }
        }
      } else if (activeForm === "email_password") {
        // Check client side first
        // Return on all errors throughout this block
        if (emailReset === userEmail) {
          setFormError({
            form: "email_password",
            message: "New email must be different from your current email.",
          });
          reset();
          return;
        }

        if (newPassword !== confirmNewPassword) {
          setFormError({
            form: "email_password",
            message: "Passwords do not match.",
          });
          reset();
          return;
        }

        if (newPassword === oldPassword) {
          setFormError({
            form: "email_password",
            message: "New password must be different from your old password.",
          });
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
            message: "Invalid Credentials",
          });
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
            reset();
            return;
          } else {
            // Password updates successfully - now update email
            const { data: emailUpdate, error: emailUpdateError } =
              await supabase.auth.updateUser({
                email: emailReset,
              });
            if (emailUpdateError) {
              setFormError({
                form: "email_password",
                message:
                  "Error updating email address. Click email reset above to try again.",
              });
              setFormSuccess({
                form: "email_password",
                message: "Password updated!",
              });
              reset();
              return;
            } else {
              setNewEmail(emailReset);
              setFormError(null);
              setFormSuccess({
                form: "email_password",
                message: `Success! Email and password have been updated! Watch out for a confirmation email — your account will keep using your old email until you confirm.`,
              });

              reset();
            }
          }
        }
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
        <h1>Update Profile</h1>
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
          {formError?.form === activeForm &&
            activeForm !== "email_password" && (
              <div className="reset-overlay">
                <div className="reset-message-container">
                  <span className="reset-error-message">
                    {formError?.message}
                  </span>
                </div>
              </div>
            )}

          {formSuccess?.form === activeForm && activeForm === "email" && (
            <div className="reset-overlay">
              <div className="reset-message-container">
                <span className="reset-success-message">
                  {formSuccess.message}
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
          {(formSuccess?.form === activeForm ||
            formError?.form === activeForm) &&
            activeForm === "email_password" && (
              <div className="email-password-success-failure">
                {formError?.message && (
                  <span className="reset-error-message">
                    {formError.message}
                  </span>
                )}
                {formSuccess?.message && (
                  <span className="reset-success-message">
                    {formSuccess.message}
                  </span>
                )}
              </div>
            )}
          {emailUpdatePending && (
            <div className="email-update-pending">
              <span className="reset-success-message">
                <strong>Change Pending:</strong> Waiting for verification to
                update your account to <u>{user.new_email}</u>. Please check
                your inbox.
              </span>
            </div>
          )}

          {activeForm === "email" && formSuccess === "pending" && (
            <div className="account-settings-form-group">
              <EmailInput
                register={register}
                type="email"
                name="email_reset"
                id="email_reset"
                errors={errors}
              />
            </div>
          )}
          {activeForm === "password" && formSuccess === "pending" && (
            <>
              <div className="account-settings-form-group">
                <PasswordInput
                  register={register}
                  label="password_original"
                  name="password_original"
                  id="password_original"
                  errors={errors}
                  isCurrentPassword={true}
                />
              </div>
              <div className="account-settings-form-group">
                <PasswordInput
                  register={register}
                  label="password_reset"
                  name="password_reset"
                  id="password_reset"
                  errors={errors}
                />
              </div>
              <div className="account-settings-form-group">
                <PasswordInput
                  register={register}
                  label="confirm_password_reset"
                  name="confirm_password_reset"
                  id="confirm_password_reset"
                  errors={errors}
                  matchValue={watch("password_reset")}
                />
              </div>
            </>
          )}
          {activeForm === "email_password" && formSuccess === "pending" && (
            <>
              <div className="account-settings-form-group">
                <EmailInput
                  register={register}
                  type="email"
                  name="email_reset"
                  id="email_reset"
                  errors={errors}
                />
              </div>
              <div className="account-settings-form-group">
                <PasswordInput
                  register={register}
                  label="password_original"
                  name="password_original"
                  id="password_original"
                  errors={errors}
                  isCurrentPassword={true}
                />
              </div>
              <div className="account-settings-form-group">
                <PasswordInput
                  register={register}
                  label="password_reset"
                  name="password_reset"
                  id="password_reset"
                  errors={errors}
                />
              </div>
              <div className="account-settings-form-group">
                <PasswordInput
                  register={register}
                  label="confirm_password_reset"
                  name="confirm_password_reset"
                  id="confirm_password_reset"
                  errors={errors}
                  matchValue={watch("password_reset")}
                />
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
