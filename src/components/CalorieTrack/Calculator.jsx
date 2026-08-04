import { useState } from 'react'
import '../../styles/base.css'
import Header from './components/Header'
import Inputs from './components/Inputs'
import SelectMenu from './components/SelectMenu'
import SubmitButton from './components/SubmitButton'
import Results from './components/Results'
import { validateHeight, validateWeight, validateAge, validateGender, validateActivityLevel } from './utilities/validation'
import { calcMetricHeight, calcMetricWeight, calcBMI, calcBMR, calcDaily } from './utilities/calculations'

// ============================================================
// Calculator.jsx
// This is the single owner of all form state. All child components
// (Inputs, SelectMenu, SubmitButton, Results) are "dumb" — they receive
// values and setter functions as props and don't hold their own copies
// of this data. This keeps one source of truth: whatever Calculator says the
// state is, is the state, no matter which child component triggered
// the change.
// ============================================================

function Calculator() {

    // --- Raw form field values, always strings (inputs/selects give strings) ---
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [activityLevel, setActivityLevel] = useState('');

    // --- Calculated output, shown by Results. Starts null so Results
    // knows nothing has been submitted yet and renders nothing. ---
    const [results, setResults] = useState({ bmi: null, bmr: null, daily: null });

    // --- Per-field "is the current value valid" flags.
    // One object instead of five separate booleans so every component
    // that needs validity info gets it from the same place, and updates
    // use the {...prev, someKey: value} spread pattern so one field's
    // update never accidentally wipes out another field's flag. ---
    const [validity, setValidity] = useState({ height: true, weight: true, age: true, gender: true, activityLevel: true });

    // --- Per-field "has the user interacted with this field yet" flags.
    // Keeps the error banner hidden until a field has been touched (blurred),
    // instead of showing "invalid" the instant the page loads on an empty field. ---
    const [clicked, setClicked] = useState({ height: false, weight: false, age: false, gender: false, activityLevel: false });

    // --- Top-level submit status message (e.g. "Inputs are invalid") ---
    const [message, setMessage] = useState('');

    /**
     * Runs when the Submit button is clicked.
     * This is a *second*, authoritative validation pass — separate from
     * the live per-keystroke validation in Inputs/SelectMenu — because a
     * field the user never touched still has its default `validity: true`
     * even though its actual value (empty string) is invalid. Re-running
     * every validator fresh against current state closes that gap.
     */
    const handleSubmit = () => {
        // Re-validate everything fresh, ignoring whatever `validity` currently says.
        const validHeight = validateHeight(height);
        const validWeight = validateWeight(weight);
        const validAge = validateAge(age);
        const validGender = validateGender(gender);
        const validActivityLevel = validateActivityLevel(activityLevel);

        // Force every field to "touched" so any invalid/skipped field's
        // banner shows up now, even if the user never blurred it.
        setClicked({ height: true, weight: true, age: true, gender: true, activityLevel: true });
        setValidity({ height: validHeight, weight: validWeight, age: validAge, gender: validGender, activityLevel: validActivityLevel });

        if (validHeight && validWeight && validAge && validGender && validActivityLevel) {
            // Convert to metric units first (calculations are metric-based).
            const metricHeight = calcMetricHeight(height);
            const metricWeight = calcMetricWeight(weight);

            const bmi = calcBMI(metricWeight, metricHeight);

            // calcBMR returns a *raw, unrounded* number on purpose — it feeds
            // directly into calcDaily below. We only round it for display,
            // right here, after it's done being used in further math.
            const bmr = calcBMR(gender, metricWeight, metricHeight, age);
            const daily = calcDaily(activityLevel, bmr);

            setMessage('');
            setResults({ bmi, bmr: bmr.toFixed(0), daily });
        } else {
            // Clear any previous real results and show a graceful
            // "can't calculate" placeholder instead of stale/misleading numbers.
            setMessage('Inputs are invalid. Please try again.');
            setResults({ bmi: 'N/A', bmr: 'N/A', daily: 'N/A' });
        }
    }

    return (
        <>
            <div className="calculator-tool calculator-container">

                <Header />

                <Inputs
                    height={height} setHeight={setHeight}
                    weight={weight} setWeight={setWeight}
                    age={age} setAge={setAge}
                    gender={gender} setGender={setGender}
                    validity={validity} setValidity={setValidity}
                    clicked={clicked} setClicked={setClicked}
                />

                <SelectMenu
                    activityLevel={activityLevel} setActivityLevel={setActivityLevel}
                    validity={validity} setValidity={setValidity}
                    clicked={clicked} setClicked={setClicked}
                />

                <SubmitButton onSubmit={handleSubmit} />

                <Results
                    results={results}
                    message={message}
                />

            </div>
        </>
    )
}

export default Calculator;