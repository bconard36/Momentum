import { useForm } from "react-hook-form";
import { Link } from "react-router";
import EmailInput from "../EmailInput";
import { supabase } from "../../utils/supabaseClient";
import { useState } from "react";

const ForgotPassword = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [displayEmail, setDisplayEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      forgot_password_email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setShowConfirm(true);
      setDisplayEmail(data.forgot_password_email);
      console.log(`Email to be verified: ${data.forgot_password_email}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="return-container">
        <Link to="/sign-in" className="return-link" id="forgot-password-return">
          Return to Sign In
        </Link>
      </div>
      {showConfirm && (
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
      {!showConfirm && (
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
                Reset Forgotten Password
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default ForgotPassword;
