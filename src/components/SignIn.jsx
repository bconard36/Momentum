import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
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

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            email: "",
            password: ""
        }
    });

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
                    console.log("Error Signing In:", authError)
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
            <header className="dashboard-header">
                <h1 className="dashboard-title">Momentum</h1>
                <p className="dashboard-subtitle">
                    Log your workouts, track your progress, and check your numbers — all in one place.
                </p>
            </header>
            <div className="sign-in-container">
                <form className="sign-in-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="sign-in-form-group">
                        <label htmlFor="email">Email Address</label>
                        {errors.email && (
                            <span className="error-message">{errors.email.message}</span>
                        )}
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
                        {errors.password && (
                            <span className="error-message">{errors.password.message}</span>
                        )}
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
                    <div className="form-actions">
                        <button 
                            className="primary-button sign-in-button"
                            type="submit"
                        >
                            Sign In
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
 
export default SignIn;