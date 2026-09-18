const ForgotPassword = () => {
  return (
    <div className="forgot-password-form-container">
      <h2>Forgot Password Email Verification</h2>
      <form className="forgot-password-form">
        <div className="password-reset-form-group">
          <label htmlFor="email">Enter Email Address</label>
          <input type="email" name="email"></input>
        </div>
        <button className="secondary-button forgot-password-button">
          Reset Forgotten Password
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
