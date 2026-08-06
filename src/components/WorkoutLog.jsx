/**
 * Workout Log Component 
 * Displays all logged workouts in localStorage
 * If localStorage is empty, then a message appears
 * Incorporates state to track array status and to remove workouts from localStorage
 */
import { useState } from 'react';

/**
 * Renders a modal displaying all saved workouts, with sorting and deletion support.
 *
 * @param {Object} props
 * @param {Array<Object>} props.savedWorkouts - Array of workout objects loaded from localStorage.
 *   Each workout is expected to have: { id, date, exercises: Array<Object> }.
 * @param {(idToDelete: string) => void} props.deleteWorkout - Callback invoked with a workout's
 *   id when the user confirms deletion; parent component handles removing it from state/localStorage.
 * @returns {JSX.Element}
 */
const WorkoutLog = ({ savedWorkouts, deleteWorkout }) => {
    
    /** @type {[boolean, Function]} Controls whether the workout log modal is open. */
    const [isOpen, setIsOpen] = useState(false); 

    /** @type {[boolean, Function]} Controls whether the delete-confirmation modal is showing. */
    const [confirmDelete, setConfirmDelete] = useState(false);

    /** @type {[('asc'|'desc'), Function]} Current sort direction applied to savedWorkouts by date. */
    const [sortOrder, setSortOrder] = useState("desc");

    /** @type {[boolean, Function]} Tracks ascending state purely for the sort icon's rotation animation. */
    const [isAscending, setIsAscending] = useState(false);

    /**
     * Confirms deletion of a workout and closes the confirmation modal.
     *
     * @param {string} id - The id of the workout to delete.
     * @returns {void}
     */
    const closeDeleteModal = (id) => {
        deleteWorkout(id);
        setConfirmDelete(false);
    }

    /**
     * Formats a "YYYY-MM-DD" date string into a human-readable "Month Day, Year" string.
     * Manually splits and reconstructs the date using local time (year, month, day) args
     * instead of passing the raw string to `new Date()`, which would parse it as UTC
     * midnight and can roll the date back a day depending on the user's timezone.
     *
     * @param {string} dateStr - Date string in "YYYY-MM-DD" format.
     * @returns {string} Formatted date (e.g. "January 5, 2025"), or an empty string if dateStr is falsy.
     */
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        const localDate = new Date(year, month - 1, day); // local time, no UTC shift
        return localDate.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    /**
     * A copy of savedWorkouts sorted by date according to sortOrder.
     * Recomputed on every render since it depends on savedWorkouts and sortOrder;
     * `new Date(a.date)` is safe for comparison purposes even with the UTC quirk,
     * since only relative ordering (not the displayed value) matters here.
     *
     * @type {Array<Object>}
     */
    const sortDates = [...savedWorkouts].sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();

        // If the sort order is ascending, older dates are first
        // Otherwise, return the descending (newer dates first)
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    /**
     * Toggles sort order between ascending and descending, and flips the
     * sort icon's rotation state to match.
     *
     * @returns {void}
     */
    const handleSort = () => {
        setIsAscending(!isAscending);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
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
                        <div className="sort-container">
                            <span className="sort-direction-label">Sort: {sortOrder === 'desc' ? "Newest Workouts First" : "Oldest Workouts First"}</span>
                            {/* Style the sort icon inline to allow for conditional rendering based on sort order */}
                            <svg width="35px" height="35px" viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg" id="sort-ascending" className="sort-icon" 
                                style={{
                                    fill: "currentColor",
                                    transform: isAscending ? "rotate(180deg)" : "rotate(0deg)",
                                    transition: "transform 0.2s ease"
                                }}
                                onClick={() => handleSort()}>
                                <path d="M6,20a1,1,0,0,1-.71-.29l-4-4a1,1,0,0,1,1.42-1.42L6,17.59l3.29-3.3a1,1,0,0,1,1.42,1.42l-4,4A1,1,0,0,1,6,20Z"></path>
                                <path d="M6,20a1,1,0,0,1-1-1V4A1,1,0,0,1,7,4V19A1,1,0,0,1,6,20Z"></path>
                                <path d="M20,17H15a1,1,0,0,1,0-2h5a1,1,0,0,1,0,2Z"></path>
                                <path d="M20,12H13a1,1,0,0,1,0-2h7a1,1,0,0,1,0,2Z"></path>
                                <path d="M20,7H10a1,1,0,0,1,0-2H20a1,1,0,0,1,0,2Z"></path>
                            </svg>
                        </div>
                        {sortDates.map((workout, index) => (
                            <div key={index}>
                                <p className="date-header">{formatDate(workout.date)}</p>
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