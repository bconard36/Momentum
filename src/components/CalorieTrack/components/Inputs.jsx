import { validateHeight, validateWeight, validateAge, validateGender } from "../utilities/validation";

// ============================================================
// Inputs.jsx
// Renders the height/weight/age/gender text fields. Holds no state of
// its own — height/weight/age/gender and the validity/clicked tracking
// objects all live in App.jsx and are passed down as props, along with
// their setter functions. This component's only job is to render inputs
// and call the setters it was given whenever the user types or blurs.
//
// Each field follows the same pattern:
//   onChange -> update the raw value AND re-run that field's validator,
//               storing the boolean result in the shared `validity` object.
//   onBlur   -> mark that field as "touched" in the shared `clicked` object,
//               which is what allows its error banner to appear.
// ============================================================

const InputForm = ({ height, setHeight, weight, setWeight, age, setAge, gender, setGender,
    validity, setValidity, clicked, setClicked
 }) => { 

    return ( 
        <>

            <div className="inputs-section">

                <fieldset className="metrics">

                    <legend>Please provide the following values:</legend>

                    {/* --- Height --- */}
                    <label htmlFor="height">Enter Height (in Inches):</label>
                    <input 
                        type="number" 
                        id="height" 
                        required 
                        aria-describedby="heightError"
                        value={height}
                        onChange={ (e) => {
                            const value = e.target.value; 
                            setHeight(value);
                            // Spread the previous validity object so only the
                            // `height` key changes — weight/age/gender/activityLevel
                            // flags are left untouched.
                            setValidity((prev) => ({ ...prev, height: validateHeight(value) })); 
                        }}
                        onBlur={ () => setClicked((prev) => ({ ...prev, height: true })) }
                        />
                    {/* Only show the banner once the field has been touched AND is currently invalid */}
                    {clicked.height && !validity.height && (
                        <div className="invalid-input-banner" id="heightError" aria-live="polite">
                            <span>Invalid Height. Height range must be between 53in - 84in.</span>
                        </div>
                    )}

                    {/* --- Weight --- */}
                    <label htmlFor="weight">Enter Weight (in Pounds):</label>
                    <input 
                        type="number" 
                        id="weight" 
                        required 
                        aria-describedby="weightError"
                        value={weight}
                        onChange={ (e) => {
                            const value = e.target.value;
                            setWeight(value);
                            setValidity((prev) => ({ ...prev, weight: validateWeight(value) })); 
                        }}
                        onBlur={ () => setClicked((prev) => ({ ...prev, weight: true })) }
                        />
                    
                    {clicked.weight && !validity.weight && (
                        <div className="invalid-input-banner" id="weightError" aria-live="polite">
                            <span>Invalid Weight. Weight must be greater than 50 and less than 1000 pounds (lbs).</span>
                        </div>
                    )}

                    {/* --- Age --- */}
                    <label htmlFor="age">Enter Age:</label>
                    <input 
                        type="number" 
                        id="age" 
                        required 
                        aria-describedby="ageError"
                        value={age}
                        onChange={ (e) => {
                            const value = e.target.value;
                            setAge(value);
                            setValidity((prev) => ({ ...prev, age: validateAge(value) }));
                        }}
                        onBlur={ () => setClicked((prev) => ({ ...prev, age: true }))}
                        />
                    
                    {clicked.age && !validity.age && (
                        <div className="invalid-input-banner" id="ageError" aria-live="polite">
                            <span>Invalid Age. Age must be between 12 and 100.</span>
                        </div>
                    )}

                    {/* --- Gender --- */}
                    <label htmlFor="gender">Enter Assigned Sex/Gender at Birth:</label>
                    <input 
                        type="text" 
                        id="gender" 
                        required 
                        aria-describedby="genderError"
                        value={gender}
                        onChange={ (e) => { 
                            const value = e.target.value;
                            setGender(value);
                            setValidity((prev) => ({ ...prev, gender: validateGender(value)}));
                        }}
                        onBlur={ () => setClicked((prev) => ({ ...prev, gender: true }))}
                        />
                    {clicked.gender && !validity.gender && (
                        <div className="invalid-input-banner" id="genderError" aria-live="polite">
                            <span>Invalid gender. Input M/m or F/f.</span>
                        </div>
                    )}

                </fieldset>

            </div>

        </>
     );
}
 
export default InputForm;
