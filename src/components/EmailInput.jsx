/**
 * Email Input Component
 * Renders an email input field with validation and conditional labeling.
 * @param {Object} props - email input properties
 * @param {Function} props.register - React Hook Form register function
 * @param {string} props.type - input field type
 * @param {string} props.name - email input field name
 * @param {string} props.id - email input field ID
 * @param {Object} props.errors - form validation errors
 * @returns {JSX.Element} email input field
 */
const EmailInput = ({ register, type, name, id, errors }) => {
  const fieldError = errors?.[name];

  const inputLabel =
    name === "email_reset" ? "New Email Address" : "Email Address";

  return (
    <>
      <label htmlFor={id}>{inputLabel}</label>
      {fieldError && (
        <span className="error-message">{fieldError.message}</span>
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
