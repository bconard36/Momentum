/**
 * Create Account Form Component
 */
import { useForm } from "react-hook-form";
import { supabase } from "../utils/supabaseClient"

const CreateAccount = () => {

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

    const passwordValue = watch("password", "");

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
            console.log("Data inserted:", data.first_name, data.last_name, data.email)
        } catch (error) {
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
 
export default CreateAccount;