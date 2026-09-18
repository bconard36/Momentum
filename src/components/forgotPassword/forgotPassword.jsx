const ForgotPassword = () => {
  return (
    <div className="forgot-password-form-container">
      <form className="forgot-password-form">
        <span>Forgot Password Email Verification</span>
        <label htmlFor="email">Enter Email Address</label>
        <input type="email" name="email"></input>
      </form>
    </div>
  );
};

export default ForgotPassword;
