import { useFieldArray, useForm } from "react-hook-form";
import { supabase } from "../utils/supabaseClient";

/**
 * Edit Workout Component
 * @param {Object} props
 * @param {Array<Object>} props.workout - Single workout object with an array of exercises to edit 
 * @param {Function<Object>} props.setIsEditing - Sets boolean state of edit workout modal
 * 
 * @returns {JSX.Element}
 */

const EditWorkout = ({ workout, setIsEditing, fetchWorkoutLog }) => {

    // Store workout_id for onSubmit supabase.rpc call 
    const workoutId =  workout.workout_id;

    /**
     * * react-hook-form controls for the edit workout form.
     * @property {Function} register - Registers an input field for validation/tracking.
     * @property {Object} control - Passed to useFieldArray to bind the exercises array.
     * @property {Function} handleSubmit - Wraps onSubmit with validation.
     * @property {Object} formState - Contains errors and isSubmitSuccessful.
     */
    const { register, control, watch, handleSubmit, formState: { errors, isSubmitted } } = useForm({
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

    const onSubmit = async (data) => {
        // Prevent submission if exercise array is empty
        if (data.exercises.length === 0) {
            alert('A workout needs at least one exercise. Delete the workout instead if you wish to remove it entirely.');
            return;
        }
        
        
        let resolvedExerciseData = [];
        if (data.exercises.length > workout.exercises.length) {
            // Inspect incoming data exercise arraty discrepancies 
            // Assign UUIDs for null exercise_id values 
            // Same process as WorkoutForm, different data structure
            resolvedExerciseData = await Promise.all(data.exercises.map(async (exercise) => {
                if (exercise.exercise_id === null) {
                    // Map through null exercise IDs to find matching names and types in the DB
                    const name = exercise.name.toLowerCase().trim();
                    const type = exercise.type.toLowerCase().trim();
                    const { data: editData, error: editError } = await supabase
                        .from("exercises")
                        .select("*")
                        .match({ name: name, type: type });
                    
                    if (editData?.length > 0) {
                        const noChange = {
                            exercise_id: editData[0].exercise_id,
                            sets: exercise.sets,
                            reps: exercise.reps,
                            weight: exercise.weight,
                            duration_minutes: exercise.duration_minutes,
                            duration_seconds: exercise.duration_seconds
                        };
                        return noChange;
                    } else {
                        const exerciseAdd = {
                            exercise_id: crypto.randomUUID(),
                            type: type,
                            name: name,
                            sets: exercise.sets,
                            reps: exercise.reps,
                            weight: exercise.weight,
                            duration_minutes: exercise.duration_minutes,
                            duration_seconds: exercise.duration_seconds
                        };
                        return exerciseAdd;
                    }
                }

                return exercise; 
            }));
        } else {
            // If exercise list is the same length or shorter (i.e. exercises were removed or workouts were unchanged)
            resolvedExerciseData = data.exercises;
        }
        try {
            // RPC for custom edit_workout function 
            const { error } = await supabase.rpc("edit_workout", {
                p_workout_id: workoutId,
                // Deconstruct resolvedWorkout - date is expected
                // Extract from data, then assign resolvedData to exercises
                resolved_workout: { date: data.date, exercises: resolvedExerciseData }
            });

            if (error) {
                console.log("Error editing workout: ", error);
            } else {
                // Success message / Redirect / Re-render workout-log 
                console.log('Success!');
            }
        } catch (error) {
            console.log("Error: ", error)
        }   
        fetchWorkoutLog(); 
    }
    
    return ( 
        <>
            {/* Use built-in validate method to ensure date is not in the future */}
            <div className="edit-modal-overlay">
                <form className="workout-form edit-workout-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="field-card date-card">
                        <label className="field-label workout-date-label" htmlFor="workout-date">Workout Date</label>
                        {/* {errors.date && (
                            <span className="error-message">{errors.date.message}</span>
                        )} */}
                        {/* Date is read only in edit workout - SQL function does not handle date (yet?)
                            How often will a user need to change a workout date?
                        */}
                        <input 
                            id="workout-date" 
                            type="date" 
                            readOnly
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
                                            readOnly
                                            {...register(`exercises.${index}.name`)}
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
                                            readOnly
                                            {...register(`exercises.${index}.type`)}
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
                                    {/* Only enable when exercise list is greater than one */}
                                    {/* A workout needs one exercise — remove button when only 1 is left in array */}
                                    {fields.length > 1 && (
                                        <button type="button" className="secondary-button" onClick={() => remove(index)}>
                                        Remove Exercise
                                    </button>
                                    )}
                                </div>
                            );
                        })}
                        <div className="edit-workout-button-container">
                            <button className="secondary-button" id="back-to-edit-button" type="button" onClick={() => setIsEditing(false)}>
                                Back
                            </button>
                            <button className="secondary-button" type="button" onClick={() => append({ 
                                exercise_id: null,
                                date: workout.date,
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
                {isSubmitted && (
                    <div className="workout-modal-overlay success-overlay" onClick={() => setIsEditing(false)}>
                        <p className="success-message">Success! Workout Edited!</p>
                        <div className="success-return-container">
                            <button className="secondary-button success-redirect" type="button" onClick={() => setIsEditing(false)}>
                                Back to Workout Log
                            </button>                                
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
 
export default EditWorkout;