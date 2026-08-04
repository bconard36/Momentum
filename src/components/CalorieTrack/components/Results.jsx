import { useEffect, useState } from "react";

// ============================================================
// Results.jsx
// Displays calculated BMI/BMR/TDEE (or a graceful "N/A" + error message
// if validation failed) inside a modal-style overlay.
//
// `hasSubmitted` checks results.bmi != null rather than a separate
// boolean, because results starts as {bmi: null, ...} in App.jsx and
// only ever gets overwritten by handleSubmit — so its non-null-ness
// already tells us "a submit attempt has happened," whether it
// succeeded (real numbers) or failed (the string 'N/A').
//
// `isOpen` is local state, not lifted to App, because nothing outside
// this component needs to know whether the results modal is currently
// visible — only Results itself cares.
//
// The useEffect below is what makes the modal reopen automatically on
// every new submission, even if the user had previously closed it:
// results is a *new object reference* every time handleSubmit runs
// (even if the numbers happen to be identical to last time), so the
// effect fires and resets isOpen to true.
// ============================================================

const Results = ({ results, message }) => {
    const hasSubmitted = results.bmi != null;

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(true);
    }, [results])

    return (
        <>
            {hasSubmitted && isOpen && (
                // Clicking the dark overlay (anywhere outside the panel) closes the
                // modal, matching the same click-outside-to-close behavior as the
                // term-definition modals in Header.jsx. 
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    {/* stopPropagation prevents a click inside the panel from bubbling
                        up to the overlay and accidentally closing the modal. */}
                    <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Calculation results" onClick={(e) => e.stopPropagation()}>
                        {message && (
                            <div className={`result-message${message.toLowerCase().includes('invalid') ? ' error' : ''}`}>
                                {message}
                            </div>
                        )}

                        <div className="results-list">
                            <div className="result-item">
                                <strong>BMI</strong>
                                <span>{results.bmi}</span>
                            </div>
                            <div className="result-item">
                                <strong>BMR</strong>
                                <span>{results.bmr} calories/day</span>
                            </div>
                            <div className="result-item">
                                <strong>Estimated TDEE</strong>
                                <span>{results.daily} calories/day</span>
                            </div>
                            <div className="modal-actions">
                                <button className="close-button" onClick={() => setIsOpen(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Results;
