import { useState } from "react";

const PasswordInput = ({ label, name, id, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="form-group">
      <label htmlFor={label}>
        {label === "confirm-password" || label === "confirm-password-reset"
          ? "Confirm Password"
          : "Enter Password"}
      </label>
      {(errors.password || errors.confirm - password) && (
        <span className="error-message">{errors.password.message}</span>
      )}
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        id={id}
        autoComplete="new-password"
        {...register("password", {
          required: "Password is required.",
          minLength: {
            value: 12,
            message: "Password must be at least 12 characters",
          },
          maxLength: {
            value: 30,
            message: "Password must be less than 30 characters",
          },
          pattern: {
            value: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
            message:
              "Password needs an uppercase letter, a number, and a symbol.",
          },
        })}
      />
      <svg
        width="50px"
        height="50px"
        viewBox="-0.5 0 25 25"
        style={{
          fill: "currentColor",
        }}
        xmlns="http://www.w3.org/2000/svg"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
      >
        <path
          d="M20.595 11.38C15.855 6.60001 8.145 6.60001 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 
                                18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
          stroke="#0F0F0F"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 
                                9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
          stroke="#0F0F0F"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default PasswordInput;
