/**
 * Create Account Form Component
 */
import { useForm } from "react-hook-form";
import { supabase } from "../utils/supabaseClient"

/**
 * Create Account Component Constructor 
 * Utilizes react-hook-form to capture and send form data for account creation 
 * supabaseClient receives and handles the data 
 * email, password, first_name, last_name sent to the auth.users table in Supabase 
 * Stored function and trigger in DB handle auto-insert into public.users
 * public.users receives remainder of form data as a "profile" table
 * @returns {JSX.Element}
 */
const SignUp = () => {

    /**
     * react-hook-form controls for the Create Account form 
     * @property {Function} register - Registers an input field for validation/tracking.
     * @property {Function} watch - Watches a field's live value (used for real time password matching).
     * @property {Function} handleSubmit - Wraps onSubmit with validation.
     * @property {Object} formState - Contains errors and isSubmitSuccessful.
     * @property {Function} reset - Resets the form to defaultValues.
     */
    const { register, watch, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm({
        defaultValues: {
            "first_name": "",
            "last_name": "",
            email: "",
            password: "",
            "confirm-password": ""
        },
        mode: "onChange"
    });

    // Store the passwordValue for real-time string matching 
    const passwordValue = watch("password", "");

    /**
     * Handles successful form submission: builds a new user record in auth.users,
     * where the email, password, first and last names are sent.
     * Password is hashed/encrypted (password transport ends there) by Supabase
     * @param {Object} data - create account form data 
     * 
     * @returns {void}
     */
    const onSubmit = async (data) => {
        try {
            // Create the user account in auth schema first 
            // DB triggers in place to INSERT into public schema on success
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        first_name: data["first_name"],
                        last_name: data["last_name"]
                    }
                }
            });
        } catch (error) {
            // Need better error handling here — graceful modal/pop up message? 
            console.error("Account creation error", error);
        }
    }

    return ( 
        <>
            <div className="create-account-container">
                <form className="create-account-form" onSubmit={handleSubmit(onSubmit)}>

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

                    <div className="form-actions">
                        <button 
                            className="primary-button create-button"
                            type="submit"
                        >
                            Create Account
                        </button>
                        <button 
                            className="primary-button clear-button"
                            type="reset"
                        >
                            Clear
                        </button>
                    </div>

                </form>
            </div>
        </>
     );
}
 
export default SignUp;