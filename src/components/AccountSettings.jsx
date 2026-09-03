import { Link } from "react-router";

const AccountSettings = () => {
  return (
    <>
      <div className="return-container">
        <Link to="/dashboard" className="return-link" id="workout-return">
          Return to Dashboard
        </Link>
      </div>
      <div className="account-settings-header-container">
        <h1>User Account Settings</h1>
      </div>
    </>
  );
};

export default AccountSettings;
