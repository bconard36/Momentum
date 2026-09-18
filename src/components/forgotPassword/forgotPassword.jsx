import { useForm } from "react-hook-form";
import { Link } from "react-router";
import EmailInput from "../EmailInput";
import { supabase } from "../../utils/supabaseClient";

const ForgotPassword = () => {
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
      <div className="forgot-password-form-container">
        <h2>Forgot Password Email Verification</h2>
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
  );
};

export default ForgotPassword;
