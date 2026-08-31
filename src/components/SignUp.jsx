import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../utils/supabaseClient";

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
      "confirm-password": "",
    },
    mode: "onChange",
  });

  // Local password visibility state management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Create account success/failure state management
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createFail, setCreateFail] = useState(false);

  // Watch password field so confirm-password can validate against its current value
  const passwordValue = watch("password", "");

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
              <Link to="/sign-in" className="return-link" id="sign-in-return">
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
              <label htmlFor="email">Email</label>
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
              <input
                type="email"
                name="email"
                id="email"
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            <div className="sign-up-form-group">
              <label htmlFor="password">Password</label>
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="new-password"
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 12,
                    message: "Password must be at least 12 characters",
                  },
                  maxLength: {
                    value: 30,
                    message: "Password must be less than 30 characters",
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                    message:
                      "Password needs an uppercase letter, a number, and a symbol.",
                  },
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
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <path
                  d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                  stroke="#0F0F0F"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                  stroke="#0F0F0F"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="sign-up-form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              {errors["confirm-password"] && (
                <span className="error-message">
                  {errors["confirm-password"].message}
                </span>
              )}
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm-password"
                id="confirm-password"
                {...register("confirm-password", {
                  required: "Please confirm your password.",
                  validate: (value) =>
                    value === passwordValue || "Passwords do not match",
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
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <path
                  d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                  stroke="#0F0F0F"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                  stroke="#0F0F0F"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
