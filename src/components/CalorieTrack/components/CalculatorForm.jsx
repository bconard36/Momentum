// ============================================================
// CalculatorForm.jsx
// Calculates BMI, BMR, and TDEE Fitness metrics
// Refactored from the original version to incorporate react hook form 
// ============================================================
import { useForm } from 'react-hook-form';
import Header from './Header';
import { validateHeight, validateWeight, validateAge, validateGender, validateActivityLevel } from '../utilities/validation';
import { calcMetricHeight, calcMetricWeight, calcBMI, calcBMR, calcDaily } from '../utilities/calculations';
import Results from './Results';
import { useState } from 'react';

/**
 * Form for calculating BMI, BMR, & TDEE metrics, backed by react-hook-form. Validates
 * inputs before submission and renders specific error messages gracefully. Calculates
 * the metric values using imported calculations, passing in the form data for the missing 
 * values. Validation methods were left out to reduce boilerplate — react-hook-form uses
 * built-in validation methods. 
 * 
 * @returns {JSX.Element}
 */

const CalculatorForm = () => {

    /**
     * react-hook-form controls for the Calculator form
     * @property {Function} register - Registers an input field for validation/tracking
     * @property {Function} handleSubmit - Wraps onSubmit with validation
     * @property {Object} formState - Contains errors for invalid inputs
     * @property {Function} reset - Resets the form to defaultValues
     */
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            height: null,
            weight: null,
            age: null,
            gender: '',
            activityLevel: ''
        }
    });

    /**
     * @type {[Object, Function]} Stores the results object with metric-specific properties
     */
    const [results, setResults] = useState('');

    /**
     * @type {[boolean, Function]} Controls whether the results modal is showing
     */
    const [showResults, setShowResults] = useState(false);

    /**
     * Handles form data and resets form on successful submission: 
     *  - Calculates metric values for height and age 
     *  - Calculates BMI, BMR, and TDEE values based on derived metric values
     * @param {Object} data - Form data collected by react-hook-form (height, weight, age, gender, activityLevel)
     */
    const onSubmit = (data) => {
        const metricHeight = calcMetricHeight(data.height);
        const metricWeight = calcMetricWeight(data.weight);
        const bmi = calcBMI(metricWeight, metricHeight);

        // calcBMR returns a *raw, unrounded* number on purpose — it feeds
        // directly into calcDaily below. We only round it for display
        // after it's done being used in further math.
        const bmr = calcBMR(data.gender, metricWeight, metricHeight, data.age);
        const daily = calcDaily(data.activityLevel, bmr);
        const formResults = {
            bmi: bmi,
            bmr: bmr.toFixed(0), // Round BMR here
            daily: daily
        };
        setShowResults(true);
        setResults(formResults);
        reset();
    }

    return ( 
        <>
            <Header />
            <div id="inputs">

                <form className="calculator-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="metrics">
                        <label htmlFor="height">Enter Height (in inches)</label>
                        {errors.height && (
                            <span className="error-message calculator-error-message">{errors.height.message}</span>
                        )}
                        <input 
                            id="height"
                            type="number"
                            {...register('height', {
                                valueAsNumber: true,
                                required: "Height (in inches) is required",
                                validate: {
                                    inRange: (value) => validateHeight(value) || "Height must be between 53 and 84 inches",
                                    isNumber: (value) => !isNaN(value) || "Height must be a number"
                                }
                            })}
                        />
                        <label htmlFor="weight">Enter Weight (in pounds)</label>
                        {errors.weight && (
                            <span className="error-message calculator-error-message">{errors.weight.message}</span>
                        )}
                        <input 
                            id="weight"
                            type="number"
                            {...register('weight', {
                                valueAsNumber: true,
                                required: "Weight (in pounds) is required",
                                validate: {
                                    inRange: (value) => validateWeight(value) || "Weight must be between 50 and 1000 pounds (lbs)",
                                    isNumber: (value) => !isNaN(value) || "Weight must be a number"
                                }
                            })}
                        />
                        <label htmlFor="age">Enter Age</label>
                        {errors.age && (
                            <span className="error-message calculator-error-message">{errors.age.message}</span>
                        )}
                        <input 
                            id="age"
                            type="number"
                            {...register('age', {
                                valueAsNumber: true,
                                required: "Age is required",
                                validate: {
                                    inRange: (value) => validateAge(value) || "Age must be between 12 and 100 (inclusive)",
                                    isNumber: (value) => !isNaN(value) || "Age must be a number"
                                }
                            })}
                        />
                        <label htmlFor="gender">Assigned Sex/Gender at Birth</label>
                        {errors.gender && (
                            <span className="error-message calculator-error-message">{errors.gender.message}</span>
                        )}
                        <input 
                            id="gender"
                            type="text"
                            {...register('gender', {
                                required: "Sex/Gender is required",
                                validate: (value) => validateGender(value) || "Gender must be M/m for Male or F/f for Female"
                            })}
                        />
                    </div>

                    <div className="activity">
                        <label htmlFor="activityLevel">Please choose a number corresponding to your activity levels:</label>
                        {errors.activityLevel && (
                            <span className="error-message calculator-error-message">{errors.activityLevel.message}</span>
                        )}
                        <select 
                            id="activityLevel"
                            {...register('activityLevel', {
                                required: "Activity Level is required",
                                validate: (value) => validateActivityLevel(value) || "Activity Level must be 1-5. Please choose an option from the list."
                            })}
                        >
                            <option value="">Select One</option>
                            <option value="1">1. Sedentary (little or no exercise)</option>
                            <option value="2">2. Lightly Active (light exercise/sports 1-3 days/week)</option>
                            <option value="3">3. Moderately Active (moderate exercise/sports 3-5 days/week)</option>
                            <option value="4">4. Very Active (hard exercise/sports 6-7 days a week)</option>
                            <option value="5">5. Extra Active (very hard exercise/sports & a physical job)</option>
                        </select>
                    </div>
                    <div className="calculator-submit-container">
                        <button type="submit" value="Submit">Submit</button>
                    </div>
                </form>
                {showResults && (
                    <Results 
                        results={results}
                    />
                )}
            </div>
        </>

     );
}
 
export default CalculatorForm;