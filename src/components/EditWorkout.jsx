import { useState } from "react";
import { Link } from "react-router";
import { useFieldArray, useForm } from "react-hook-form";

/**
 * Edit Workout Component
 * @param {Object} props
 * @param {Array<Object>} props.workout - Single workout object with an array of exercises to edit 
 * @param {(idToDelete: string) => void} props.deleteWorkout - Callback invoked with a workout's
 *   id when the user confirms deletion
 * @param {Boolean<Object>} props.isEditing - Boolean state of edit workout modal; default - true
 * @param {Function<Object>} props.setIsEditing - Sets boolean state of edit workout modal
 * 
 * @returns {JSX.Element}
 */

const EditWorkout = ({ workout, deleteWorkout, isEditing, setIsEditing }) => {

    /**
     * * react-hook-form controls for the edit workout form.
     * @property {Function} register - Registers an input field for validation/tracking.
     * @property {Object} control - Passed to useFieldArray to bind the exercises array.
     * @property {Function} handleSubmit - Wraps onSubmit with validation.
     * @property {Object} formState - Contains errors and isSubmitSuccessful.
     */
    const { register, control, watch, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm({
        defaultValues: {
            date: workout.date,
            exercises: workout.exercises
        }
    });

    /**
     * Field array bindings for the dynamic "exercises" list.
     * @property {Array<Object>} fields - Current exercise rows (each with a stable field.id).
     * @property {(value: Object) => void} append - Adds a new exercise row.
     * @property {(index: number) => void} remove - Removes an exercise row by index.
     */
    const { fields, append, remove } = useFieldArray({
        control,
        name: "exercises"
    });

    const onSubmit = (data) => {
        setIsEditing(false);
        console.log("Updated workout data: ", data);
        // Update database with new data values 
        // Custom RPC for UPDATE call here
        // Display success message when edit is successful
    }
    
    return ( 
        <>
            {/* Use built-in validate method to ensure date is not in the future */}
            <div className="edit-modal-overlay">
                <form className="workout-form edit-workout-form" onSubmit={handleSubmit(onSubmit)}>
                    
                <p className="edit-return-link" onClick={() => setIsEditing(false)}>Back</p>
                    <div className="field-card date-card">
                        <label className="field-label workout-date-label" htmlFor="workout-date">Workout Date</label>
                        {/* {errors.date && (
                            <span className="error-message">{errors.date.message}</span>
                        )} */}
                        <input 
                            id="workout-date" 
                            type="date" 
                            {...register("date", {
                                required: "Workout date is required.",
                                // max: {
                                //     value: todayStr,
                                //     message: "Date cannot be in the future."
                                // }, 
                                // validate: (value) => {
                                //     const selected = new Date(value);
                                //     const today = new Date;
                                //     today.setHours(0, 0, 0, 0);
                                //     return selected <= today || "Cannot pick a future date.";
                                // }
                            })}
                                />
                    </div>
                    
                    
                        {fields.map((exercise, index) => {
                            const isExistingExercise = Boolean(exercise.exercise_id);
                            const exerciseType = watch(`exercises.${index}.type`);

                            return (
                                <div className="field-card" key={exercise.id}>

                                    {/* Exercise Name */}
                                    <label className="field-label" htmlFor={`exercise-name-${index}`}>
                                        Exercise Name
                                    </label>

                                    {isExistingExercise ? (
                                        <input
                                            id={`exercise-name-${index}`}
                                            type="text"
                                            value={exercise.name}
                                            readOnly
                                        />
                                    ) : (
                                        <input
                                            id={`exercise-name-${index}`}
                                            type="text"
                                            {...register(`exercises.${index}.name`, {
                                                required: "Exercise name is required.",
                                                minLength: {
                                                    value: 2,
                                                    message: "Exercise name must be at least 2 characters."
                                                },
                                                maxLength: {
                                                    value: 50,
                                                    message: "Exercise name cannot exceed 50 characters."
                                                }
                                            })}
                                        />
                                    )}

                                    {/* Exercise Type */}
                                    <label className="field-label" htmlFor={`exercise-type-${index}`}>
                                        Exercise Type
                                    </label>

                                    {isExistingExercise ? (
                                        <input
                                            id={`exercise-type-${index}`}
                                            type="text"
                                            value={exercise.type}
                                            readOnly
                                        />
                                    ) : (
                                        <select
                                            id={`exercise-type-${index}`}
                                            {...register(`exercises.${index}.type`, {
                                                required: "Exercise type is required."
                                            })}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="strength">Strength</option>
                                            <option value="duration">Duration</option>
                                        </select>
                                    )}

                                    {/* Strength Metrics */}
                                    {exerciseType === "strength" && (
                                        <>
                                            <div className="field-group number-field-group">
                                                <label className="field-label" htmlFor={`exercise-weight-${index}`}>
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
                                                            message: "Weight cannot be negative."
                                                        },
                                                        max: {
                                                            value: 3000,
                                                            message: "Weight cannot exceed 3000."
                                                        }
                                                    })}
                                                />
                                            </div>

                                            <div className="field-group number-field-group">
                                                <label className="field-label" htmlFor={`exercise-sets-${index}`}>
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
                                                            message: "There must be at least 1 (one) set."
                                                        },
                                                        max: {
                                                            value: 100,
                                                            message: "Set count cannot exceed 100."
                                                        }
                                                    })}
                                                />
                                            </div>

                                            <div className="field-group number-field-group orphan-group">
                                                <label className="field-label" htmlFor={`exercise-reps-${index}`}>
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
                                                            message: "There must be at least 1 (one) rep."
                                                        },
                                                        max: {
                                                            value: 1000,
                                                            message: "Rep count cannot exceed 1000."
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Duration Metrics */}
                                    {exerciseType === "duration" && (
                                        <>
                                            <div className="field-group number-field-group">
                                                <label className="field-label" htmlFor={`exercise-duration-minutes-${index}`}>
                                                    Duration (minutes)
                                                </label>
                                                <input
                                                    id={`exercise-duration-minutes-${index}`}
                                                    type="number"
                                                    {...register(
                                                        `exercises.${index}.duration_minutes`,
                                                        {
                                                            valueAsNumber: true,
                                                            required: "Duration (minutes) is required.",
                                                            min: {
                                                                value: 0,
                                                                message: "Minutes cannot be negative."
                                                            },
                                                            max: {
                                                                value: 300,
                                                                message: "Minutes cannot exceed 300."
                                                            }
                                                        }
                                                    )}
                                                />
                                            </div>

                                            <div className="field-group number-field-group">
                                                <label className="field-label centered-label" htmlFor={`exercise-duration-seconds-${index}`}>
                                                    Duration (seconds)
                                                </label>

                                                {errors.exercises?.[index]?.duration_seconds && (
                                                    <span className="error-message">
                                                        {errors.exercises[index].duration_seconds.message}
                                                    </span>
                                                )}

                                                <input
                                                    id={`exercise-duration-seconds-${index}`}
                                                    type="number"
                                                    {...register(
                                                        `exercises.${index}.duration_seconds`,
                                                        {
                                                            valueAsNumber: true,
                                                            required: "Duration (seconds) is required.",
                                                            min: {
                                                                value: 0,
                                                                message: "Seconds cannot be negative."
                                                            },
                                                            max: {
                                                                value: 59,
                                                                message: "Seconds cannot exceed 59."
                                                            }
                                                        }
                                                    )}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Remove Exercise */}
                                    <button type="button" className="secondary-button" onClick={() => remove(index)}>
                                        Remove Exercise
                                    </button>
                                </div>
                            );
                        })}
                        <div className="workout-button-container">
                            <button className="secondary-button" onClick={() => append({ 
                                exercise_id: null,
                                name: "",
                                type: "",
                                sets: undefined,
                                reps: undefined,
                                weight: undefined,
                                duration_minutes: undefined,
                                duration_seconds: undefined
                            })}>Add Another Exercise</button>
                            <button className="primary-button" type="submit">
                                Save Changes
                            </button>
                        </div>
                </form>
            </div>
        </>
    );
}
 
export default EditWorkout;