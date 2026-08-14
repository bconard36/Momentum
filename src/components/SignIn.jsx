import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { supabase } from "../utils/supabaseClient";
/**
 * Sign In component
 * Provides a form for user authentication using an email address and a password
 * On successful authentication, navigates the user to the Dashboard
 *  
 * @returns {JSX.Element} - Sign in component
 */
const SignIn = () => {

    // Initialize navigation hook 
    const navigate = useNavigate();

    const { register, handleSubmit, setError, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            email: "",
            password: ""
        }
    });

    // Get error message for email or password fields
    const emailPasswordError = errors.email?.message || errors.password?.message || null;

    /**
     * Submit Form handler 
     * @param {Object} data - user data sent to Supabase for authentication 
     */
    const onSubmit = async (data) => {
            try {
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password
                });

                if (authError) {
                    setError("root", {
                        type: "server",
                        message: authError.message,
                    });
                } else {
                    // Navigate to the dashboard after successful authentication 
                    navigate("/dashboard", { replace: true });
                }
            } catch (error) {
                console.error(error);
            }
            
    }

    return ( 
        <>
            <div className="sign-in-container">
                <form className="sign-in-form" onSubmit={handleSubmit(onSubmit)}>
                    <h1 className="dashboard-title" id="form-title">Momentum</h1>
                    <div className="sign-in-form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            {...register("email", {
                                required: "Email address is required"
                            })}
                        />
                    </div>
                    <div className="sign-in-form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            autoComplete="current-password" 
                            {...register("password", {
                                required: "Password is required"
                            })}
                        />
                    </div>
                    {errors.root?.message && (
                        <p className="error-root">{errors.root.message}</p>
                    )}
                    {emailPasswordError && (
                        <div className="error-container">
                            <span className="error-message">{emailPasswordError}</span>
                        </div>
                    )}
                    <div className="form-actions">
                        <button 
                            className="primary-button sign-in-button"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            { isSubmitting ? "Signing in..." : "Sign In"}
                        </button>
                        <button 
                            className="secondary-button clear-button"
                            type="reset"
                        >
                            Clear
                        </button>
                    </div>
                </form>
                <div className="sign-up-action">
                    <span className="no-account">Don't have an account?</span>
                    <Link to="/sign-up">
                        <button className="primary-button">
                                Sign Up
                        </button>
                    </Link>
                </div>
            </div>
        </>
     );
}
 
export default SignIn;