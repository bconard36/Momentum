import { useForm } from "react-hook-form";
import PasswordInput from "../PasswordInput";
import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Link, useNavigate } from "react-router";
// Will need to accept reset token for authentication!
const UpdateForgottenPassword = () => {
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(null); // Same format as account setting form - error name and message properties
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
      {!formSuccess && formError !== null && (
        <div className="forgotten-password-reset-failure">
          <span className="error-message">Error updating password.</span>
          <p>{formError}</p>
          <Link to="/forgot-password" className="password-reset-error-redirect">
            Please try again
          </Link>
        </div>
      )}
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
