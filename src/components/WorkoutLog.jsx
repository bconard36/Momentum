/**
 * Workout Log Component 
 * Displays all logged workouts in localStorage
 * If localStorage is empty, then a message appears
 * Incorporates state to track array status and to remove workouts from localStorage
 */
import { useState } from 'react';

const WorkoutLog = ({ savedWorkouts, deleteWorkout }) => {
    

    const [isOpen, setIsOpen] = useState(false); 

    return ( 
        <>

            <div className="workout-log-button-container">
                <button className="secondary-button" type="button" onClick={() => setIsOpen(true)}>
                    View Logged Workouts
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
                                            <p>Exercise: {exercise.name}</p>
                                            <p>Weight (lbs): {exercise.weight}</p>
                                            <p>Sets: {exercise.sets}</p>
                                            <p>Reps: {exercise.reps}</p>
                                            <p>Type: {exercise.type}</p>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="secondary-button delete-workout" onClick={() => deleteWorkout(workout.id)}>Delete Workout</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
     );
}
 
export default WorkoutLog;