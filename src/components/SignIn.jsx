import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { supabase } from "../utils/supabaseClient";
/**
 * Sign In component constructor 
 * Holds Email and Password inputs for account sign in
 * @returns Sign in component 
 */
const SignIn = () => {

    // Initialize navigation hook 
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm({
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async (data) => {
            try {
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.password
                });

                if (authError) {
                    console.log("Error Signing In:", authError)
                } else {
                    // Redirect to Dashboard here 
                    navigate("/dashboard", { replace: true });
                    // console.log("got here");
                }
            } catch (error) {
                console.error(error);
            }
            
    }

    return ( 
        <>
            <div className="sign-in-container">
                <form className="sign-in-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="sign-in-form-group">
                        <label htmlFor="email">Email Address</label>
                        {errors.email && (
                            <span className="error-message">{errors.email.message}</span>
                        )}
                        <input 
                            type="text" 
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