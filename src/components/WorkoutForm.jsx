// ============================================================
// WorkoutForm.jsx
// Builds one workout entry consisting of a date and a dynamic list
// of strength or duration-based exercises.
// ============================================================
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../utils/supabaseClient";

/**
 * Form for logging a new workout consisting of a date and one or more dynamic exercises.
 * Uses React Hook Form for form management and Supabase for authenticated user access and exercise lookup
 *
 * @returns {JSX.Element}
 */
const WorkoutForm = ({ fetchWorkoutLog }) => {
  /** @type {boolean} Controls save workout error state */
  const [saveError, setSaveError] = useState(false);

  /** @type {string} Today's date as "YYYY-MM-DD", used to cap the date input from allowing future dates. */
  const todayStr = new Date().toISOString().split("T")[0];

  /**
   * react-hook-form controls for the workout form.
   * @property {Function} register - Registers an input field for validation/tracking.
   * @property {Object} control - Passed to useFieldArray to bind the exercises array.
   * @property {Function} watch - Watches a field's live value (used for exerciseType branching).
   * @property {Function} handleSubmit - Wraps onSubmit with validation.
   * @property {Object} formState - Contains errors and isSubmitSuccessful.
   * @property {Function} reset - Resets the form to defaultValues.
   */
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm({
    defaultValues: {
      date: "",
      exercises: [], // Default an empty array — user should not have to fill in a blank row
      exercise: {
        name: "",
        type: "",
        sets: 0,
        reps: 0,
        weight: 0,
        duration_minutes: 0,
        duration_seconds: 0,
      },
    },
  });

  /** @type {[boolean, Function]} Controls whether the post-submit success modal is showing. */
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Field array bindings for the dynamic "exercises" list.
   * @property {Array<Object>} fields - Current exercise rows (each with a stable field.id).
   * @property {(value: Object) => void} append - Adds a new exercise row.
   * @property {(index: number) => void} remove - Removes an exercise row by index.
   */
  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  /**
   * Processes a submitted workout by authenticating the current user,
   * identifying existing exercises or generating IDs for new exercises,
   * extracting exercise metrics, and preparing records for the
   * workouts and workout_exercises tables.
   *
   * @param {Object} data - Form data containing the workout date and exercises.
   * @returns {Promise<void>}
   */
  const onSubmit = async (data) => {
    // Retrieve the authenticated user so the workout can be associated with their account
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Prevent unauthorized workout form submission
    if (authError || !user) {
      alert("You must be logged in to submit this form");
      return;
    }

    // Generate a unique workout ID to be shared by all exerciseList items
    const workoutId = crypto.randomUUID();

    /**
     * Resolves each submitted exercise against the exercises table.
     * Existing exercises reuse their database ID; new exercises receive
     * a generated UUID and normalized name/type.
     */
    const resolvedExercises = await Promise.all(
      data.exercises.map(async (exercise) => {
        const normalizedExercise = exercise.name.toLowerCase().trim();
        const type = exercise.type.toLowerCase().trim();
        const { data: existingExercise, error: exerciseError } = await supabase
          .from("exercises")
          .select("*")
          .match({ name: normalizedExercise, type: type });
        // Match found, no need to assign a new ID for name already in DB
        // console.log("Exercise lookup:", existingExercise);
        // console.log("Exercise lookup error:", exerciseError);
        if (existingExercise?.length > 0) {
          const repeatExercise = {
            exercise_id: existingExercise[0].exercise_id,
            type: existingExercise[0].type,
            name: existingExercise[0].name,
          };
          return repeatExercise;
        } else {
          const newExercise = {
            exercise_id: crypto.randomUUID(),
            type: type,
            name: normalizedExercise,
          };
          return newExercise;
        }
      }),
    );
    /**
     * Extracts workout-specific metrics from each submitted exercise.
     * Strength exercises provide sets, reps, and weight.
     * Duration exercises provide duration in minutes and seconds.
     */
    const generateMetricData = data.exercises.map((exercise) => {
      const rawSeconds = exercise?.["duration-seconds"];
      const normalizedSeconds =
        rawSeconds === null ||
        rawSeconds === undefined ||
        rawSeconds === "" ||
        Number.isNaN(Number(rawSeconds))
          ? 0
          : Number(rawSeconds);
      const workoutMetrics = {
        sets: exercise?.sets,
        reps: exercise?.reps,
        weight: exercise?.weight,
        duration_minutes: exercise?.["duration-minutes"],
        duration_seconds: normalizedSeconds,
      };
      return workoutMetrics;
    });

    /**
     * Combines resolved exercise IDs with their corresponding workout metrics
     * and shared workout ID to prepare records for the workout_exercises table
     */
    const newWorkoutExercise = resolvedExercises.map((exercise, index) => {
      // Build one workout_exercises record for the current exercise.
      const workoutExerciseToAdd = {
        workout_id: workoutId,
        exercise_id: exercise.exercise_id,
        sets: generateMetricData[index].sets,
        reps: generateMetricData[index].reps,
        weight: generateMetricData[index].weight,
        duration_minutes: generateMetricData[index].duration_minutes,
        duration_seconds: generateMetricData[index].duration_seconds,
      };
      return workoutExerciseToAdd;
    });

    /**
     * Builds the workout record for the workouts table using the
     * submitted workout date, and shared workout ID.
     */
    const workoutEntry = {
      workout_id: workoutId,
      date: data.date,
    };

    // Insert workout data into respective tables using DB Function
    const { data: workoutData, error: insertError } = await supabase.rpc(
      "save_workout",
      {
        workout_entry: workoutEntry,
        resolved_exercises: resolvedExercises,
        workout_exercise_list: newWorkoutExercise,
      },
    );

    if (insertError) {
      console.error("Insert error: ", insertError.message);
      setSaveError(true);
    } else {
      reset();
      setSaveError(false);
      setShowSuccess(true);
      fetchWorkoutLog();
    }
  };

  /**
   * Closes the success modal and returns the user to the workout form by
   * appending a single blank exercise row (so fields.length > 0 and the
   * form view renders instead of the empty state).
   *
   * @returns {void}
   */
  const handleCloseModal = () => {
    setShowSuccess(false);
    append({ type: "" });
  };

  return (
    <div className="workout-page">
      <div className="return-container">
        <Link to="/dashboard" className="return-link" id="workout-return">
          Return to Dashboard
        </Link>
      </div>

      <div className="workout-shell">
        <header className="workout-header">
          <h1 className="workout-title">Action Breeds Energy</h1>
          <p className="workout-subtitle" id="workout-form-cta">
            Log workouts <strong>|</strong> Stay consistent <strong>|</strong>{" "}
            Build Momentum
          </p>
        </header>

        {/* Pass savedWorkouts array and deleteWorkout method down as props to workout log */}
        {/* This keeps all form data true to this component */}

        <div className="workout-log-button-container">
          <Link to="/logs">
            <button className="secondary-button" id="form-log-link">
              View Workout Log
            </button>
          </Link>
        </div>

        <form className="workout-form" onSubmit={handleSubmit(onSubmit)}>
          {showSuccess && (
            <div
              className="workout-modal-overlay success-overlay"
              onClick={() => setShowSuccess(false)}
            >
              <p className="success-message">Success! Workout Saved!</p>
              <div className="success-return-container">
                <button
                  className="secondary-button success-redirect"
                  type="button"
                  onClick={handleCloseModal}
                >
                  Build New Workout
                </button>
              </div>
            </div>
          )}
          {saveError && (
            <div
              className="workout-modal-overlay"
              onClick={() => setSaveError(false)}
            >
              <p className="error-message">Error Saving Workout</p>
              <div className="error-return-container">
                <button
                  className="secondary-button error-redirect"
                  type="button"
                  onClick={() => setSaveError(false)}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          {!showSuccess && fields.length === 0 ? (
            <div className="empty-state">
              <div className="form-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() =>
                    append({
                      name: "",
                      sets: undefined,
                      reps: undefined,
                      weight: undefined,
                      type: "",
                      duration_minutes: 0,
                      duration_seconds: 0,
                    })
                  }
                >
                  Build New Workout
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Use built-in validate method to ensure date is not in the future */}
              <div className="field-card date-card">
                <label
                  className="field-label workout-date-label"
                  htmlFor="workout-date"
                >
                  Workout Date
                </label>
                {errors.date && (
                  <span className="error-message">{errors.date.message}</span>
                )}
                <input
                  id="workout-date"
                  type="date"
                  {...register("date", {
                    required: "Workout date is required.",
                    max: {
                      value: todayStr,
                      message: "Date cannot be in the future.",
                    },
                    validate: (value) => {
                      const selected = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return selected <= today || "Cannot pick a future date.";
                    },
                  })}
                />
              </div>

              {fields.map((field, index) => {
                // Watch the exercise type to render the correct form
                const exerciseType = watch(`exercises.${index}.type`);
                return (
                  <div className="field-card" key={field.id}>
                    <div className="field-grid">
                      <div className="field-group full-width conditional">
                        <label className="field-label centered-label">
                          Workout Type
                        </label>
                        {errors.exercises?.[index]?.type && (
                          <span className="error-message">
                            {errors.exercises[index].type.message}
                          </span>
                        )}
                        <div className="radio-group">
                          <label
                            className="radio-option"
                            htmlFor={`exercise-type-duration-${index}`}
                          >
                            <input
                              id={`exercise-type-duration-${index}`}
                              type="radio"
                              value="Duration"
                              {...register(`exercises.${index}.type`, {
                                required: "Workout type is required.",
                              })}
                            />
                            <div className="radio-text">
                              <span>Duration</span>
                              <br />
                              <span>(Time-based exerices)</span>
                            </div>
                          </label>
                          <label
                            className="radio-option"
                            htmlFor={`exercise-type-strength-${index}`}
                          >
                            <input
                              id={`exercise-type-strength-${index}`}
                              type="radio"
                              value="Strength"
                              {...register(`exercises.${index}.type`, {
                                required: "Workout type is required.",
                              })}
                            />
                            <div className="radio-text">
                              <span>Repetition</span>
                              <br />
                              <span>(Rep-based exercises)</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Duration Form Render */}
                      {exerciseType === "Duration" && (
                        <>
                          <div className="field-group full-width">
                            <label
                              className="field-label"
                              htmlFor={`exercise-name-${index}`}
                            >
                              Exercise Name
                            </label>
                            {errors.exercises?.[index]?.name && (
                              <span className="error-message">
                                {errors.exercises[index].name.message}
                              </span>
                            )}
                            <input
                              id={`exercise-name-${index}`}
                              type="text"
                              {...register(`exercises.${index}.name`, {
                                required: "Exercise name is required",
                                minLength: {
                                  value: 2,
                                  message:
                                    "Exercise name must be at least 2 characters.",
                                },
                                maxLength: {
                                  value: 50,
                                  message:
                                    "Exercise name cannot exceed 50 characters.",
                                },
                              })}
                            />
                          </div>
                          <div className="field-group number-field-group">
                            <label
                              className="field-label"
                              htmlFor={`exercise-duration-minutes-${index}`}
                            >
                              Duration (minutes)
                            </label>
                            {errors.exercises?.[index]?.[
                              "duration-minutes"
                            ] && (
                              <span className="error-message">
                                {
                                  errors.exercises[index]["duration-minutes"]
                                    .message
                                }
                              </span>
                            )}
                            <input
                              id={`exercise-duration-minutes-${index}`}
                              type="number"
                              {...register(
                                `exercises.${index}.duration-minutes`,
                                {
                                  valueAsNumber: true,
                                  required: "Duration (minutes) is required.",
                                  min: {
                                    value: 0,
                                    message: "Minutes cannot be negative.",
                                  },
                                  max: {
                                    value: 300,
                                    message: "Minutes cannot exceed 300",
                                  },
                                },
                              )}
                            />
                          </div>
                          <div className="field-group number-field-group">
                            <label
                              className="field-label centered-label"
                              htmlFor={`exercise-duration-seconds-${index}`}
                            >
                              Duration (seconds)
                            </label>
                            {errors.exercises?.[index]?.[
                              "duration-seconds"
                            ] && (
                              <span className="error-message">
                                {
                                  errors.exercises[index]["duration-seconds"]
                                    .message
                                }
                              </span>
                            )}
                            <input
                              id={`exercise-duration-seconds-${index}`}
                              type="number"
                              {...register(
                                `exercises.${index}.duration-seconds`,
                                {
                                  valueAsNumber: true,
                                  min: {
                                    value: 0,
                                    message: "Seconds cannot be negative.",
                                  },
                                  max: {
                                    value: 59,
                                    message: "Seconds cannot exceed 59.",
                                  },
                                },
                              )}
                            />
                          </div>
                        </>
                      )}

                      {/* Strength Form Render */}
                      {exerciseType === "Strength" && (
                        <>
                          <div className="field-group full-width">
                            <label
                              className="field-label"
                              htmlFor={`exercise-name-${index}`}
                            >
                              Exercise Name
                            </label>
                            {errors.exercises?.[index]?.name && (
                              <span className="error-message">
                                {errors.exercises[index].name.message}
                              </span>
                            )}
                            <input
                              id={`exercise-name-${index}`}
                              type="text"
                              {...register(`exercises.${index}.name`, {
                                required: "Exercise name is required",
                                minLength: {
                                  value: 2,
                                  message:
                                    "Exercise name must be at least 2 characters.",
                                },
                                maxLength: {
                                  value: 50,
                                  message:
                                    "Exercise name cannot exceed 50 characters.",
                                },
                              })}
                            />
                          </div>
                          <div className="field-group number-field-group">
                            <label
                              className="field-label"
                              htmlFor={`exercise-weight-${index}`}
                            >
                              Weight (lbs)
                            </label>
                            {errors.exercises?.[index]?.weight && (
                              <span className="error-message">
                                {errors.exercises[index].weight.message}
                              </span>
                            )}
                            <input
                              id={`exercise-weight-${index}`}
                              type="number"
                              {...register(`exercises.${index}.weight`, {
                                valueAsNumber: true,
                                required: "Weight is required.",
                                min: {
                                  value: 0,
                                  message: "Weight cannot be negative.",
                                },
                                max: {
                                  value: 3000,
                                  message: "Weight cannot exceed 3000.",
                                },
                              })}
                            />
                          </div>
                          <div className="field-group number-field-group">
                            <label
                              className="field-label"
                              htmlFor={`exercise-sets-${index}`}
                            >
                              Sets
                            </label>
                            {errors.exercises?.[index]?.sets && (
                              <span className="error-message">
                                {errors.exercises[index].sets.message}
                              </span>
                            )}
                            <input
                              id={`exercise-sets-${index}`}
                              type="number"
                              {...register(`exercises.${index}.sets`, {
                                valueAsNumber: true,
                                required: "Set count is required.",
                                min: {
                                  value: 1,
                                  message:
                                    "There must be at least 1 (one) set.",
                                },
                                max: {
                                  value: 100,
                                  message: "Set count cannot exceed 100.",
                                },
                              })}
                            />
                          </div>
                          <div className="field-group number-field-group orphan-group">
                            <label
                              className="field-label"
                              htmlFor={`exercise-reps-${index}`}
                            >
                              Reps
                            </label>
                            {errors.exercises?.[index]?.reps && (
                              <span className="error-message">
                                {errors.exercises[index].reps.message}
                              </span>
                            )}
                            <input
                              id={`exercise-reps-${index}`}
                              type="number"
                              {...register(`exercises.${index}.reps`, {
                                valueAsNumber: true,
                                required: "Rep count is required.",
                                min: {
                                  value: 1,
                                  message:
                                    "There must be at least 1 (one) rep.",
                                },
                                max: {
                                  value: 1000,
                                  message: "Rep count cannot exceed 1000.",
                                },
                              })}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="workout-button-container">
                      <div className="form-actions">
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => append({ type: "" })}
                        >
                          Add Another Exercise
                        </button>
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => remove(index)}
                        >
                          Clear Exercise
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="form-actions">
                <button className="primary-button submit" type="submit">
                  Save Workout
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default WorkoutForm;
