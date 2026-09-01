import { Link } from "react-router";

const CalculatorPreview = () => {
  return (
    <div className="preview preview-calculator">
      <div className="preview-calculator-header">
        <h3>Know your numbers</h3>
        <p>BMI, BMR, and TDEE — calculated in seconds.</p>
      </div>
      <div className="preview-mock-calculator">
        <div className="mock-field">
          <label>Height (inches)</label>
          <div className="mock-input">70</div>
        </div>
        <div className="mock-field">
          <label>Weight (lbs)</label>
          <div className="mock-input">180</div>
        </div>
        <div className="mock-field">
          <label>Age</label>
          <div className="mock-input">29</div>
        </div>

        <div className="mock-result">
          <span className="mock-result-label">BMI</span>
          <span className="mock-result-value">25.8</span>
        </div>
      </div>

      <Link to="/calculator" className="btn btn-primary">
        Try the calculator
      </Link>
    </div>
  );
};

export default CalculatorPreview;
