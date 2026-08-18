import { useFieldArray, useForm } from "react-hook-form";

/**
 * Edit Workout Component
 * @param {Object} props
 * @param {Array<Object>} props.workout - Single workout object with an array of exercises to edit 
 * @param {(idToDelete: string) => void} props.deleteWorkout - Callback invoked with a workout's
 *   id when the user confirms deletion
 * 
 * @returns {JSX.Element}
 */

const EditWorkout = ({ workout, deleteWorkout }) => {

    /**
     * * react-hook-form controls for the edit workout form.
     * @property {Function} register - Registers an input field for validation/tracking.
     * @property {Object} control - Passed to useFieldArray to bind the exercises array.
     * @property {Function} handleSubmit - Wraps onSubmit with validation.
     * @property {Object} formState - Contains errors and isSubmitSuccessful.
     */
    const { register, control, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm({
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
        console.log("Updated workout data: ", data);
    }
    
    return ( 
        <>
            {/* Use built-in validate method to ensure date is not in the future */}
            <form className="workout-form" onSubmit={handleSubmit(onSubmit)}>
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
                
                
                    {fields.map((exercise, index) => (
                        <div className="field-card" key={exercise.id}>
                            <label className="field label" htmlFor="type">Exercise Type</label>
                            <input 
                                id="type"
                                type="text" 
                                {...register(`exercises.${index}.type`, {
                                    required: "Workout type is required."
                                })}
                                />
                            <label className="field label" htmlFor="name">Exercise Name</label>
                            <input 
                                id="name"
                                type="text" 
                                {...register(`exercises.${index}.name`, {
                                    required: "Workout name is required."
                                })}
                                />
                            {exercise.type === 'strength' && (
                                <>
                                    <div className="field-group number-field-group">
                                        <label className="field-label" htmlFor="weight">Weight (lbs)</label>
                                        {errors.exercises?.[index]?.weight && (
                                            <span className="error-message">{errors.exercises[index].weight.message}</span>
                                        )}
                                        <input
                                            id="weight"
                                            type="number"
                                            {...register(`exercises.${index}.weight`, {
                                                valueAsNumber: true,
                                                required: "Weight is required.",
                                                min: { value: 0, message: "Weight cannot be negative." },
                                                max: { value: 3000, message: "Weight cannot exceed 3000." }
                                            })}
                                        />
                                    </div>
                                    <div className="field-group number-field-group">
                                        <label className="field-label" htmlFor={`exercise-sets-${index}`}>Sets</label>
                                        {errors.exercises?.[index]?.sets && (
                                            <span className="error-message">{errors.exercises[index].sets.message}</span>
                                        )}
                                        <input
                                            id={`exercise-sets-${index}`}
                                            type="number"
                                            {...register(`exercises.${index}.sets`, {
                                                valueAsNumber: true,
                                                required: "Set count is required.",
                                                min: { value: 1, message: "There must be at least 1 (one) set." },
                                                max: { value: 100, message: "Set count cannot exceed 100." }
                                            })}
                                        />
                                    </div>
                                    <div className="field-group number-field-group orphan-group">
                                        <label className="field-label" htmlFor={`exercise-reps-${index}`}>Reps</label>
                                        {errors.exercises?.[index]?.reps && (
                                            <span className="error-message">{errors.exercises[index].reps.message}</span>
                                        )}
                                        <input
                                            id={`exercise-reps-${index}`}
                                            type="number"
                                            {...register(`exercises.${index}.reps`, {
                                                valueAsNumber: true,
                                                required: "Rep count is required.",
                                                min: { value: 1, message: "There must be at least 1 (one) rep." },
                                                max: { value: 1000, message: "Rep count cannot exceed 1000." }
                                            })}
                                        />
                                    </div>
                                </>
                            )}
                            {exercise.type === 'duration' && (
                                <>
                                    <div className="field-group number-field-group">
                                        <label className="field-label" htmlFor={`exercise-duration-minutes-${index}`}>Duration (minutes)</label>
                                        {/* {errors.exercises?.[index]?.["duration-minutes"] && (
                                            <span className="error-message">{errors.exercises[index]["duration-minutes"].message}</span>
                                        )} */}
                                        <input
                                            id={`exercise-duration-minutes-${index}`}
                                            type="number"
                                            {...register(`exercises.${index}.duration_minutes`, {
                                                valueAsNumber: true,
                                                required: "Duration (minutes) is required.",
                                                min: { value: 0, message: "Minutes cannot be negative." },
                                                max: { value: 300, message: "Minutes cannot exceed 300" }
                                            })}
                                        />
                                    </div>
                                    <div className="field-group number-field-group">
                                        <label className="field-label centered-label" htmlFor={`exercise-duration-seconds-${index}`}>Duration (seconds)</label>
                                        {errors.exercises?.[index]?.["duration-seconds"] && (
                                            <span className="error-message">{errors.exercises[index]["duration-seconds"].message}</span>
                                        )}
                                        <input
                                            id={`exercise-duration-seconds-${index}`}
                                            type="number"
                                            {...register(`exercises.${index}.duration_seconds`, {
                                                valueAsNumber: true,
                                                required: "Duration (seconds) is required.",
                                                min: { value: 0, message: "Seconds cannot be negative." },
                                                max: { value: 59, message: "Seconds cannot exceed 59." }
                                            })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        
                    ))}
            </form>
            
        </>
    );
}
 
export default EditWorkout;