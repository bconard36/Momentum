// ============================================================
// validation.js
// Pure validation logic for the Fitness & Expenditure Calculator.
// Each function takes a raw value (almost always a string, since it
// comes straight from an <input> or <select>) and returns a boolean —
// "is this value acceptable." These functions don't know or care
// about state, DOM, or React; they're reused both for live (onChange)
// validation and the final submit-time re-validation in App.jsx.
// ============================================================

/**
 * Height must be between 53 and 84 inches (inclusive).
 * @param {string|number} value - Raw height input
 * @returns {boolean}
 */
export const validateHeight = (value) => {
    const num = Number(value);
    return num >= 53 && num <= 84;
}

/**
 * Weight must be at least 50 lbs and under 1000 lbs.
 * @param {string|number} value - Raw weight input
 * @returns {boolean}
 */
export const validateWeight = (value) => {
    const num = Number(value);
    return num >= 50 && num < 1000;
}

/**
 * Age must be between 12 and 100 (inclusive).
 * @param {string|number} value - Raw age input
 * @returns {boolean}
 */
export const validateAge = (value) => {
    const num = Number(value);
    return num >= 12 && num <= 100;
}

/**
 * Gender must be one of M, m, F, f — used to pick which
 * Mifflin-St Jeor formula branch to apply in calcBMR.
 * @param {string} value - Raw gender input
 * @returns {boolean}
 */
export const validateGender = (value) => {
    const sex = String(value);
    return sex === 'M' || sex === 'm' || sex === 'F' || sex === 'f';
}

/**
 * Activity level must be a whole number 1-5, corresponding to the
 * five options in the activity <select> menu.
 * @param {string|number} value - Raw activity level input
 * @returns {boolean}
 */
export const validateActivityLevel = (value) => {
    const num = Number(value);
    return num >= 1 && num <= 5;
}