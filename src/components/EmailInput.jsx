const EmailInput = ({ register, type, name, id, errors }) => {
  const inputLabel =
    name === "email_reset" ? "New Email Address" : "Email Address";

  return (
    <>
      <label htmlFor={id}>{inputLabel}</label>
      {errors?.email && (
        <span className="error-message">{errors.email.message}</span>
      )}
      <input
        type={type}
        name={name}
        id={id}
        {...register(name, {
          required: "Email address is required.",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address",
          },
        })}
      />
    </>
  );
};

export default EmailInput;
