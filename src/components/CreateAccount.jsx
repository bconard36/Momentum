import { useForm } from "react-hook-form";

const CreateAccount = () => {

    const { register, watch, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm({
        defaultValues: {
            "first-name": "",
            "last-name": "",
            email: "",
            password: "",
            "confirm-password": ""
        },
        mode: "onChange"
    });

    const passwordValue = watch("password", "");

    const onSubmit = (data) => {
        console.log("Form submitted successfully: ", data);
    }

    return ( 
        <>
            <div className="create-account-container">
                <form className="create-account-form" onSubmit={handleSubmit(onSubmit)}>

                    <label htmlFor="first-name">First Name</label>
                    {errors["first-name"] && (
                        <span className="error-message">{errors["first-name"].message}</span>
                    )}
                    <input 
                        type="text"
                        name="first-name"
                        id="first-name"
                        {...register("first-name", {
                            required: "First name is required."
                        })}
                    />

                    <label htmlFor="last-name">Last Name</label>
                    {errors["last-name"] && (
                        <span className="error-message">{errors["last-name"].message}</span>
                    )}
                    <input 
                        type="text"
                        name="last-name"
                        id="last-name"
                        {...register("last-name", {
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
                        type="text"
                        name="password"
                        id="password"
                        {...register("password", {
                            required: "Password is required.",
                            minLength: { value: 12, message: "Password must be at least 12 characters" },
                            maxLength: { value: 30, message: "Password must be less than 30 characters" }
                        })}
                    />

                    <label htmlFor="confirm-password">Confirm Password</label>
                    {errors["confirm-password"] && (
                        <span className="error-message">{errors["confirm-password"].message}</span>
                    )}
                    <input 
                        type="text"
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