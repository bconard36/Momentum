import { useForm } from "react-hook-form";
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
    const { register, watch, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            "first_name": "",
            "last_name": "",
            email: "",
            password: "",
            "confirm-password": ""
        },
        mode: "onChange"
    });

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
            const { data, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        first_name: data["first_name"],
                        last_name: data["last_name"]
                    }
                }
            });

            if (authError) {
                    console.log("Error signing up:", authError)
            } else {
                console.log("Successful account creation!")
            }
        } catch (error) {
            // Need better error handling here — graceful modal/pop up message? 
            console.error("Account creation error", error);
        }
    }

    return ( 
        <>

                <div className="return-container">
                    <Link to="/" className="return-link" id="sign-in-return">Return to Sign In</Link>
                </div>

                <h1 className="dashboard-title" id="sign-up-title">Momentum</h1>
                <p className="dashboard-subtitle" id="sign-up-subtitle">
                    Log workouts | Track progress | All in one place
                </p>

                <form className="create-account-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="sign-up-form-group">
                        <label htmlFor="first_name">First Name</label>
                        {errors["first_name"] && (
                            <span className="error-message">{errors["first_name"].message}</span>
                        )}
                        <input 
                            type="text"
                            name="first_name"
                            id="first_name"
                            {...register("first_name", {
                                required: "First name is required."
                            })}
                        />
                    </div>
                    <div className="sign-up-form-group">
                        <label htmlFor="last_name">Last Name</label>
                        {errors["last_name"] && (
                            <span className="error-message">{errors["last_name"].message}</span>
                        )}
                        <input 
                            type="text"
                            name="last_name"
                            id="last_name"
                            {...register("last_name", {
                                required: "Last name is required."
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
                                required: "Email is required."
                            })}
                        />
                    </div>
                    <div className="sign-up-form-group">
                        <label htmlFor="password">Password</label>
                        {errors.password && (
                            <span className="error-message">{errors.password.message}</span>
                        )}
                        <input 
                            type="password"
                            name="password"
                            id="password"
                            autoComplete="new-password"
                            {...register("password", {
                                required: "Password is required.",
                                minLength: { 
                                    value: 12, 
                                    message: "Password must be at least 12 characters" 
                                },
                                maxLength: { 
                                    value: 30, 
                                    message: "Password must be less than 30 characters" 
                                },
                                pattern: {
                                    value: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                                    message: "Password needs an uppercase letter, a number, and a symbol."
                                }
                            })}
                        />
                    </div>
                    <div className="sign-up-form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        {errors["confirm-password"] && (
                            <span className="error-message">{errors["confirm-password"].message}</span>
                        )}
                        <input 
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            {...register("confirm-password", {
                                required: "Please confirm your password.",
                                validate: (value) => value === passwordValue || "Passwords do not match"
                            })}
                        />
                    </div>
                    <div className="sign-up-form-actions">
                        <button 
                            className="primary-button create-button"
                            type="submit"
                        >
                            Create Account
                        </button>
                        <button 
                            className="secondary-button clear-button"
                            type="reset"
                        >
                            Clear
                        </button>
                    </div>

                </form>
        </>
     );
}
 
export default SignUp;