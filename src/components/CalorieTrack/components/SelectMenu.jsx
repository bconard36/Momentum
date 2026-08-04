import { validateActivityLevel } from "../utilities/validation";

// ============================================================
// SelectMenu.jsx
// Renders the activity-level dropdown. Same pattern as Inputs.jsx:
// no local state, activityLevel + validity + clicked all come from
// App.jsx as props, and this component just calls the setters it
// was given on change/blur.
//
// NOTE: the five activity levels below are hardcoded as JSX <option>
// elements. If this list ever needs to change (new activity tier,
// wording tweak, etc.), consider extracting it into a plain array of
// {value, label} objects and rendering it with .map() instead —
// less repetition, and the data becomes reusable elsewhere (e.g. if
// a future "workout log" version needs the same list).
// ============================================================

const SelectMenu = ({ activityLevel, setActivityLevel, validity, setValidity, clicked, setClicked }) => {

    return ( 
        <>
        
            <div className="activity-section">

                <fieldset className="activity">

                    <legend>Please choose a number corresponding to your activity levels:</legend>

                    <select 
                        id="activityChooser" 
                        required
                        aria-describedby="activityError"
                        value={activityLevel}
                        onChange={ (e) => {
                            const value = e.target.value;
                            setActivityLevel(value);
                            setValidity((prev) => ({ ...prev, activityLevel: validateActivityLevel(value) }))
                        }}
                        onBlur={ () => setClicked((prev) => ({ ...prev, activityLevel: true })) }
                    >
                        <option value="">Select One</option>
                        <option value="1">1. Sedentary (little or no exercise)</option>
                        <option value="2">2. Lightly Active (light exercise/sports 1-3 days/week)</option>
                        <option value="3">3. Moderately Active (moderate exercise/sports 3-5 days/week)</option>
                        <option value="4">4. Very Active (hard exercise/sports 6-7 days a week)</option>
                        <option value="5">5. Extra Active (very hard exercise/sports & a physical job)</option>
                    </select>
                    
                    {clicked.activityLevel && !validity.activityLevel && (
                        <div className="invalid-input-banner" id="activityError" aria-live="polite">
                            <span>Invalid input. Please choose a number from 1-5.</span>
                        </div>
                    )}


                </fieldset>

            </div>
        
        </>
     );
}
 
export default SelectMenu;