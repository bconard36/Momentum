import { useForm } from "react-hook-form";
import PasswordInput from "../PasswordInput";
// Will need to accept reset token for authentication!
const UpdateForgottenPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      update_forgotten_password: "",
      confirm_forgotten_password_update: "",
    },
  });

  const onSubmit = (data) => {
    try {
      console.log(`Password to be updated: ${data.update_forgotten_password}`);
    } catch (error) {
      console.error(`Error updating password: ${error}`);
    }
  };

  return (
    <div className="update-forgotten-password-container">
      <h2>Update Your Password</h2>
      <form
        className="update-forgotten-password-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="update-forgotten-password-field">
          <PasswordInput
            register={register}
            label="update_forgotten_password"
            name="update_forgotten_password"
            id="update_forgotten_password"
            errors={errors}
          />
        </div>
        <div className="update-forgotten-password-field">
          <PasswordInput
            register={register}
            label="confirm_forgotten_password_update"
            name="confirm_forgotten_password_update"
            id="confirm_forgotten_password_update"
            errors={errors}
            matchValue={watch("update_forgotten_password")}
          />
        </div>
        <button className="primary-button update-forgotten-password-button">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default UpdateForgottenPassword;
