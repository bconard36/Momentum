import { useForm, useFieldArray } from "react-hook-form";
import { useState, useEffect } from 'react';
import WorkoutLog from "./WorkoutLog";

// ============================================================
// WorkoutForm.jsx
// Logs one workout entry: a date plus a dynamic list of exercises
// (name/sets/reps/weight), each row addable/removable independently.
// ============================================================

const WorkoutForm = () => {
    // Get today's date for validation
    const todayStr = new Date().toISOString().split("T")[0];

    // Initialize state by reading and parsing array from local storage, or default to an empty array
    const [savedWorkouts, setSavedWorkouts] = useState(() => {
        const saved = localStorage.getItem("workouts");
        // Return parsed, saved workouts if they exist, otherwise an empty array
        return saved ? JSON.parse(saved) : [];
    });

    // Initialize React Hook Form
    const { register, control, watch, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm({
        defaultValues: {
            date: "",
            exercises: [], // Default an empty array — user should not have to fill in a blank row 
        }
    });

    // Set state for success modal 
    const [showSuccess, setShowSuccess] = useState(false);

    // Inside the form is an array called exercises, which is what useFieldArray manages.
    const { fields, append, remove } = useFieldArray({
        control,
        name: "exercises"
    });

    const onSubmit = (data) => {
            // Build the new workout with data and a unique ID
            const newWorkout = { 
                ...data,
                id: crypto.randomUUID()
            };
            // Update localStorage with the new workout entry.
            const updatedList = [...savedWorkouts, newWorkout];
            // Update local React state with the new list of workouts 
            setSavedWorkouts(updatedList);
            setShowSuccess(true);
            // Write the updated list to local storage - don't forget to serialize
            localStorage.setItem("workouts", JSON.stringify(updatedList));
    };

    useEffect(() => {
        if (isSubmitSuccessful) {
            // Reset after success
            reset();
        }
    }, [isSubmitSuccessful, reset]);

    // Close the modal and redirect back to workout form 
    // Redirect by appending an empty type so the field list = 1
    const handleCloseModal = () => {
        setShowSuccess(false);
        append({ type: "" });
    }

    return (
        <div className="workout-page">
            <div className="return-container">
                <a href="/" className="return-link">Return to Dashboard</a>
            </div>

            <div className="workout-shell">
                <header className="workout-header">
                    <h1 className="workout-title">Action Breeds Energy</h1>
                    <p className="workout-subtitle">
                        Log your workouts <strong>|</strong> Stay consistent <strong>|</strong> Build momentum
                    </p>
                </header>

                <form className="workout-form" onSubmit={handleSubmit(onSubmit)}>
                    {showSuccess && (
                        <div className="workout-modal-overlay">
                            <p className="success-message">Success! Workout Saved!</p>
                            <div className="success-return-container">
                                <button className="secondary-button" type="button" onClick={handleCloseModal}>
                                    Build New Workout
                                </button> 
                                <WorkoutLog 
                                    savedWorkouts={savedWorkouts}
                                    deleteWorkout={(idToDelete) => {
                                        const updatedWorkouts = savedWorkouts.filter((workout, index) => workout.id !== idToDelete);
                                        setSavedWorkouts(updatedWorkouts);
                                        localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
                                        // If last workout is deleted from success modal window, close modal and return to workout form
                                        if (updatedWorkouts.length === 0) {
                                            handleCloseModal();
                                        }
                                    }} /> 
                            </div>
                        </div>
                    )}
                    {!showSuccess && fields.length === 0 ? (
                        <div className="empty-state">
                            <div className="form-actions">
                                <button
                                    className="primary-button"
                                    type="button"
                                    onClick={() => append({ name: "", sets: undefined, reps: undefined, weight: undefined, type: "" })}
                                >
                                    Build New Workout
                                </button>
                                {/* Pass savedWorkouts array and deleteWorkout method down as props to workout log */}
                                {/* This keeps all form data true to this component */}
                                <WorkoutLog 
                                    savedWorkouts={savedWorkouts}
                                    deleteWorkout={(idToDelete) => {
                                        const updatedWorkouts = savedWorkouts.filter((workout, index) => workout.id !== idToDelete);
                                        setSavedWorkouts(updatedWorkouts);
                                        localStorage.setItem("workouts", JSON.stringify(updatedWorkouts))
                                    }} />
                            </div>
                        </div>
                    ) : (
                        <>

                            {/* Pass savedWorkouts array and deleteWorkout method down as props to workout log */}
                            {/* This keeps all form data true to this component */}
                            <WorkoutLog 
                                savedWorkouts={savedWorkouts}
                                deleteWorkout={(idToDelete) => {
                                    const updatedWorkouts = savedWorkouts.filter((workout, index) => workout.id !== idToDelete);
                                    setSavedWorkouts(updatedWorkouts);
                                    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts))
                                }}
                            />

                            {/* Use built-in validate method to ensure date is not in the future */}
                            <div className="field-card date-card">
                                <label className="field-label" htmlFor="workout-date">Workout Date</label>
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
                                            message: "Date cannot be in the future."
                                        }, 
                                        validate: (value) => {
                                            const selected = new Date(value);
                                            const today = new Date;
                                            today.setHours(0, 0, 0, 0);
                                            return selected <= today || "Cannot pick a future date.";
                                        }
                                    })}
                                     />
                            </div>

                            {fields.map((field, index) => {
                                // Watch the exercise type to render the correct form
                                //
                                const exerciseType = watch(`exercises.${index}.type`);
                                return (
                                    <div className="field-card" key={field.id}>
                                        <div className="field-grid">
                                            <div className="field-group full-width conditional">
                                                <label className="field-label centered-label">Workout Type</label>
                                                {errors.exercises?.[index]?.type && (
                                                    <span className="error-message">{errors.exercises[index].type.message}</span>
                                                )}
                                                <div className="radio-group">
                                                    <label className="radio-option" htmlFor={`exercise-type-duration-${index}`}>
                                                        <input
                                                            id={`exercise-type-duration-${index}`}
                                                            type="radio"
                                                            value="Duration"
                                                            {...register(`exercises.${index}.type`, {
                                                                required: "Workout type is required."
                                                            })}
                                                        />
                                                        <div className="radio-text">
                                                            <span>Duration-Based</span>
                                                            <br />
                                                            <span>(Cardio, Mobility, Warm-Up/Cool down)</span>
                                                        </div>
                                                    </label>
                                                    <label className="radio-option" htmlFor={`exercise-type-strength-${index}`}>
                                                        <input
                                                            id={`exercise-type-strength-${index}`}
                                                            type="radio"
                                                            value="Strength"
                                                            {...register(`exercises.${index}.type`, {
                                                                required: "Workout type is required."
                                                            })}
                                                        />
                                                        <div className="radio-text">
                                                            <span>Rep-Based</span>
                                                            <br />
                                                            <span>(Weight/Machine Strength Training)</span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Duration Form Render */}
                                            {exerciseType === "Duration" && (
                                                <>
                                                    <div className="field-group">
                                                        <label className="field-label" htmlFor={`exercise-name-${index}`}>Exercise Name</label>
                                                        {errors.exercises?.[index]?.name && (
                                                            <span className="error-message">{errors.exercises[index].name.message}</span>
                                                        )}
                                                        <input
                                                            id={`exercise-name-${index}`}
                                                            type="text"
                                                            {...register(`exercises.${index}.name`, {
                                                                required: "Exercise name is required",
                                                                minLength: { value: 2, message: "Exercise name must be at least 2 characters." },
                                                                maxLength: { value: 50, message: "Exercise name cannot exceed 50 characters." }
                                                            })}
                                                            placeholder="Exercise Name"
                                                        />
                                                    </div>
                                                    <div className="field-group">
                                                        <label className="field-label" htmlFor={`exercise-duration-minutes-${index}`}>Duration (minutes)</label>
                                                        {errors.exercises?.[index]?.["duration-minutes"] && (
                                                            <span className="error-message">{errors.exercises[index]["duration-minutes"].message}</span>
                                                        )}
                                                        <input
                                                            id={`exercise-duration-minutes-${index}`}
                                                            type="number"
                                                            {...register(`exercises.${index}.duration-minutes`, {
                                                                valueAsNumber: true,
                                                                required: "Duration (minutes) is required.",
                                                                min: { value: 0, message: "Minutes cannot be negative." },
                                                                max: { value: 300, message: "Minutes cannot exceed 300" }
                                                            })}
                                                            placeholder="Duration (minutes)"
                                                        />
                                                    </div>
                                                    <div className="field-group orphan-group">
                                                        <label className="field-label centered-label" htmlFor={`exercise-duration-seconds-${index}`}>Duration (seconds)</label>
                                                        {errors.exercises?.[index]?.["duration-seconds"] && (
                                                            <span className="error-message">{errors.exercises[index]["duration-seconds"].message}</span>
                                                        )}
                                                        <input
                                                            id={`exercise-duration-seconds-${index}`}
                                                            type="number"
                                                            {...register(`exercises.${index}.duration-seconds`, {
                                                                valueAsNumber: true,
                                                                required: "Duration (seconds) is required.",
                                                                min: { value: 0, message: "Seconds cannot be negative." },
                                                                max: { value: 59, message: "Seconds cannot exceed 59." }
                                                            })}
                                                            placeholder="Duration (seconds)"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* Strength Form Render */}
                                            {exerciseType === "Strength" && (
                                                <>
                                                    <div className="field-group">
                                                        <label className="field-label" htmlFor={`exercise-name-${index}`}>Exercise Name</label>
                                                        {errors.exercises?.[index]?.name && (
                                                            <span className="error-message">{errors.exercises[index].name.message}</span>
                                                        )}
                                                        <input
                                                            id={`exercise-name-${index}`}
                                                            type="text"
                                                            {...register(`exercises.${index}.name`, {
                                                                required: "Exercise name is required",
                                                                minLength: { value: 2, message: "Exercise name must be at least 2 characters." },
                                                                maxLength: { value: 50, message: "Exercise name cannot exceed 50 characters." }
                                                            })}
                                                            placeholder="Exercise Name"
                                                        />
                                                    </div>
                                                    <div className="field-group">
                                                        <label className="field-label" htmlFor={`exercise-weight-${index}`}>Weight (lbs)</label>
                                                        {errors.exercises?.[index]?.weight && (
                                                            <span className="error-message">{errors.exercises[index].weight.message}</span>
                                                        )}
                                                        <input
                                                            id={`exercise-weight-${index}`}
                                                            type="number"
                                                            {...register(`exercises.${index}.weight`, {
                                                                valueAsNumber: true,
                                                                required: "Weight is required.",
                                                                min: { value: 0, message: "Weight cannot be negative." },
                                                                max: { value: 3000, message: "Weight cannot exceed 3000." }
                                                            })}
                                                            placeholder="Weight (lbs)"
                                                        />
                                                    </div>
                                                    <div className="field-group">
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
                                                            placeholder="Sets"
                                                        />
                                                    </div>
                                                    <div className="field-group">
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
                                                            placeholder="Reps"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="workout-button-container">
                                            <div className="form-actions">
                                                <button className="secondary-button" type="button" onClick={() => append({ type: "" })}>
                                                    Add Another Exercise
                                                </button>
                                                <button className="secondary-button" type="button" onClick={() => remove(index)}>
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
}

export default WorkoutForm;