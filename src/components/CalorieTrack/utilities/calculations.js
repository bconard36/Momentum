// ============================================================
// calculations.js
// Pure calculation logic for the Fitness & Expenditure Calculator.
// No React, no DOM — every function here takes plain values in
// and returns plain values out, which makes them independently
// testable and reusable outside of any component.
// ============================================================

// --- Unit conversion constants ---
const METER_CONVERSION = 0.0254;      // inches -> meters
const KILOGRAM_CONVERSION = 2.20462;  // pounds per kilogram (divide lbs by this to get kg)

// --- Activity multipliers used in the TDEE (Total Daily Energy Expenditure) formula ---
// Source: standard Mifflin-St Jeor activity multiplier table
const SEDENTARY = 1.2;
const LIGHTLY_ACTIVE = 1.375;
const MODERATELY_ACTIVE = 1.55;
const VERY_ACTIVE = 1.725;
const EXTRA_ACTIVE = 1.9;

/**
 * Converts height from inches to meters.
 * @param {number|string} height - Height in inches (string is fine; multiplication coerces it)
 * @returns {number} Height in meters
 */
export const calcMetricHeight = (height) => {
    const metricHeight = height * METER_CONVERSION;
    return metricHeight;
}

/**
 * Converts weight from pounds to kilograms.
 * @param {number|string} weight - Weight in pounds
 * @returns {number} Weight in kilograms
 */
export const calcMetricWeight = (weight) => {
    const metricWeight = weight / KILOGRAM_CONVERSION;
    return metricWeight;
}

/**
 * Calculates Body Mass Index (BMI) using the standard metric formula:
 * BMI = weight(kg) / height(m)^2
 *
 * NOTE: rounding to 1 decimal happens here, at the very end of the
 * calculation, so no intermediate math ever operates on a rounded value.
 * @param {number} metricWeight - Weight in kilograms
 * @param {number} metricHeight - Height in meters
 * @returns {string} BMI, rounded to 1 decimal place, ready for display
 */
export const calcBMI = (metricWeight, metricHeight) => {
    const bmi = (metricWeight / (metricHeight ** 2)).toFixed(1);
    return bmi;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 * This is the number of calories the body burns at rest.
 *
 * IMPORTANT: this returns a *raw, unrounded number* on purpose — it feeds
 * directly into calcDaily() below, and rounding here first would compound
 * error into the TDEE result. Only round once, at the point of display
 * (handled by the caller, e.g. in App.jsx when building the results object).
 * @param {string} gender - 'M'/'m' or 'F'/'f'
 * @param {number} metricWeight - Weight in kilograms
 * @param {number} metricHeight - Height in meters
 * @param {number} age - Age in years
 * @returns {number} BMR in calories/day (unrounded)
 */
export const calcBMR = (gender, metricWeight, metricHeight, age) => {
    let bmr;
    if (gender === 'm' || gender === 'M') {
        bmr = (10 * metricWeight) + (6.25 * (metricHeight * 100)) - (5 * age) + 5;
    } else {
        bmr = (10 * metricWeight) + (6.25 * (metricHeight * 100)) - (5 * age) - 161;
    }
    return bmr;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) by applying an
 * activity-level multiplier to BMR.
 *
 * activityLevel arrives from a <select> element, so it's always a string
 * (e.g. "3") even though it represents a number 1-5 — Number() below
 * converts it once, explicitly, rather than relying on JS's implicit
 * string-to-number coercion during comparison.
 *
 * Rounding to a whole number happens here, at the final step, since BMR
 * is passed in unrounded (see calcBMR above).
 * @param {string|number} activityLevel - Value 1-5 from the activity select menu
 * @param {number} bmr - Raw (unrounded) BMR from calcBMR
 * @returns {string|undefined} TDEE in calories/day, rounded to a whole number.
 *   Returns undefined if activityLevel isn't 1-5 (shouldn't happen post-validation).
 */
export const calcDaily = (activityLevel, bmr) => {
    const level = Number(activityLevel);
    let daily;

    if (level === 1) {
        daily = (bmr * SEDENTARY).toFixed(0);
    } else if (level === 2) {
        daily = (bmr * LIGHTLY_ACTIVE).toFixed(0);
    } else if (level === 3) {
        daily = (bmr * MODERATELY_ACTIVE).toFixed(0);
    } else if (level === 4) {
        daily = (bmr * VERY_ACTIVE).toFixed(0);
    } else if (level === 5) {
        daily = (bmr * EXTRA_ACTIVE).toFixed(0);
    }

    return daily;
}