import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../utils/supabaseClient";
import PasswordInput from "./PasswordInput";
import EmailInput from "./EmailInput";

/**
 * Sign Up Component
 * Utilizes react-hook-form to capture and send form data for account sign up
 * supabaseClient receives and handles the data 
 * email, password, first_name, last_name sent to the Supabase signUp() method
 * Stored function and trigger in DB handle auto-insert into public.users
 * Stored function constructs the Auth user profile and trigger inserts the Public user row
 
 * @returns {JSX.Element} - Sign Up form component 
 */
const SignUp = () => {
  /**
   * React Hook Form constrols for the sign-up form
   * @property {Function} register - Registers an input field for validation/tracking.
   * @property {Function} watch - Watches a field's live value (used for real time password matching).
   * @property {Function} handleSubmit - Wraps onSubmit with validation.
   * @property {Object} formState - Contains errors and isSubmitSuccessful.
   * @property {Function} reset - Resets the form to defaultValues.
   */
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    mode: "onChange",
  });

  // Create account success/failure state management
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createFail, setCreateFail] = useState(false);

  /**
     * Handles account creation by sending the user's email, password, and profile data to Supabase Auth
     * 
     * @param {Object} data - account sign up form data 
     
     * @returns {Promise<void>}
     */
  const onSubmit = async (data) => {
    try {
      // Create the user account through Supabase Auth
      // DB trigger creates corresponding profile in public.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data["first_name"],
            last_name: data["last_name"],
          },
        },
      });

      if (authError) {
        // Insert graceful pop up for error handling here
        setCreateFail(true);
        setCreateSuccess(false);
      } else {
        // Redirect to SignIn after successful account creation
        // Timeout with a message, message on Sign In, etc.
        setCreateSuccess(true);
        setCreateFail(false);
      }
    } catch (error) {
      // Insert graceful pop up for error handling here
      setCreateFail(true);
      setCreateSuccess(false);
    }
  };

  return (
    <>
      {createFail && (
        <div
          className="workout-modal-overlay success-overlay"
          id="create-success-overlay"
        >
          <p className="success-message">Unable to create your account</p>
          <div className="create-return-container">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setCreateFail(false)}
            >
              Return to Sign In
            </button>
          </div>
        </div>
      )}
      {createSuccess && (
        <div
          className="workout-modal-overlay success-overlay"
          id="create-success-overlay"
        >
          <p className="success-message">Success! Account Created!</p>
          <div className="create-return-container">
            <Link to="/dashboard" className="create-return-link">
              <button type="button" className="secondary-button">
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
      )}
      {!createSuccess && !createFail && (
        <>
          <header className="workout-header" id="create-account-header">
            <div className="return-container">
              <Link to="/" className="return-link" id="sign-in-return">
                Return to Sign In
              </Link>
            </div>
            <h1 className="workout-title" id="workout-log-title">
              Create Account
            </h1>
            <p className="workout-subtitle">Please fill out all fields.</p>
          </header>

          <form
            className="create-account-form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="sign-up-form-group">
              <label htmlFor="first_name">First Name</label>
              {errors["first_name"] && (
                <span className="error-message">
                  {errors["first_name"].message}
                </span>
              )}
              <input
                type="text"
                name="first_name"
                id="first_name"
                {...register("first_name", {
                  required: "First name is required.",
                })}
              />
            </div>
            <div className="sign-up-form-group">
              <label htmlFor="last_name">Last Name</label>
              {errors["last_name"] && (
                <span className="error-message">
                  {errors["last_name"].message}
                </span>
              )}
              <input
                type="text"
                name="last_name"
                id="last_name"
                {...register("last_name", {
                  required: "Last name is required.",
                })}
              />
            </div>
            <div className="sign-up-form-group">
              <EmailInput
                register={register}
                type="email"
                name="email"
                id="email"
                errors={errors}
              />
            </div>
            <div className="sign-up-form-group">
              <PasswordInput
                register={register}
                label="password"
                name="password"
                id="password"
                errors={errors}
              />
            </div>
            <div className="sign-up-form-group">
              <PasswordInput
                register={register}
                label="confirm_password"
                name="confirm_password"
                id="confirm_password"
                matchValue={watch("password")}
                errors={errors}
              />
            </div>
            <div className="sign-up-form-actions">
              <button className="primary-button create-button" type="submit">
                Create Account
              </button>
              <button
                className="secondary-button clear-button"
                id="clear-button"
                type="reset"
              >
                Clear
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default SignUp;
