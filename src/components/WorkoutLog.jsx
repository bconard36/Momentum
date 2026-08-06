/**
 * Workout Log Component 
 * Displays all logged workouts in localStorage
 * If localStorage is empty, then a message appears
 * Incorporates state to track array status and to remove workouts from localStorage
 */
import { useState } from 'react';

const WorkoutLog = ({ savedWorkouts, deleteWorkout }) => {
    

    const [isOpen, setIsOpen] = useState(false); 
    const [confirmDelete, setConfirmDelete] = useState(false);

    const closeDeleteModal = (id) => {
        deleteWorkout(id);
        setConfirmDelete(false);
    }

    return ( 
        <>

            <div className="workout-log-button-container">
                <button className="secondary-button" type="button" onClick={() => setIsOpen(true)}>
                    View Workout Log
                </button>
            </div>

            {savedWorkouts.length === 0 && isOpen && (
                <div className="workout-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="workout-modal-panel" role="dialog" aria-modal="true" aria-label="Workout Log Results" onClick={(e) => e.stopPropagation()}>
                        <p>No workouts logged yet.</p>
                    </div>
                </div>
            )}

            {savedWorkouts.length > 0 && isOpen && (
                <div className="workout-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="workout-modal-panel" role="dialog" aria-modal="true" aria-label="Workout Log Results" onClick={(e) => e.stopPropagation()}>
                        {savedWorkouts.map((workout, index) => (
                            <div key={index}>
                                <p className="date-header">{workout.date}</p>
                                <div className="exercise-list">
                                    {workout.exercises.map((exercise, index) => (
                                        <div key={index} className="exercise-item">
                                            {exercise.type === "Strength" && (
                                                <>
                                                    <p>Type: {exercise.type}</p>
                                                    <p>Exercise: {exercise.name}</p>
                                                    <p>Weight (lbs): {exercise.weight}</p>
                                                    <p>Sets: {exercise.sets}</p>
                                                    <p>Reps: {exercise.reps}</p>                                                    
                                                </>
                                            )}
                                            {exercise.type === "Duration" && (
                                                <>
                                                    <p>Type: {exercise.type}</p>
                                                    <p>Exercise: {exercise.name}</p>
                                                    <p>Time: {exercise["duration-minutes"]}:{exercise["duration-seconds"]}</p>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="secondary-button delete-workout" onClick={() => setConfirmDelete(true)}>Delete Workout</button>
                                {/* Delete confirmation modal window */}
                                {confirmDelete && savedWorkouts.length > 0 && (
                                    <div className="workout-modal-overlay delete-overlay">
                                        <p>Delete workout?</p>
                                        <button type="button" className="secondary-button delete-workout" onClick={() => closeDeleteModal(workout.id)}>Delete Workout</button>
                                        <button type="button" className="secondary-button" onClick={() => setConfirmDelete(false)}>Cancel</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
     );
}
 
export default WorkoutLog;