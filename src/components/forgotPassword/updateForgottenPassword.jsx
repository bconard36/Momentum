import PasswordInput from "../PasswordInput";
// Will need to accept reset token for authentication!
const UpdateForgottenPassword = () => {
  return (
    <div className="update-forgotten-password-container">
      <form className="update-forgotten-password-form">
        <PasswordInput />
      </form>
    </div>
  );
};

export default UpdateForgottenPassword;
