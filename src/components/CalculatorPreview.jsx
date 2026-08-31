import { Link } from "react-router";

const CalculatorPreview = () => {
  return (
    <div className="preview preview--calculator">
      <h3>Know your numbers</h3>
      <p>BMI, BMR, and TDEE — calculated in seconds.</p>

      <div className="preview__mock-calculator">
        <div className="mock-field">
          <label>Height</label>
          <div className="mock-input">5'10"</div>
        </div>
        <div className="mock-field">
          <label>Weight</label>
          <div className="mock-input">180 lb</div>
        </div>
        <div className="mock-field">
          <label>Age</label>
          <div className="mock-input">29</div>
        </div>

        <div className="mock-result">
          <span className="mock-result__label">BMI</span>
          <span className="mock-result__value">25.8</span>
        </div>
      </div>

      <Link to="/calculator" className="btn btn--primary">
        Try the calculator
      </Link>
    </div>
  );
};

export default CalculatorPreview;
