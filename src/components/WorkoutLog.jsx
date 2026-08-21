/**
 * Workout Log Component 
 * Displays all logged workouts in localStorage
 * If localStorage is empty, then a message appears
 * Incorporates state to track array status and to remove workouts from localStorage
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import EditWorkout from './EditWorkout';

/**
 * Renders a modal displaying all saved workouts, with sorting, filtering and deletion support.
 *
 * @param {Object} props
 * @param {Array<Object>} props.savedWorkouts - Array of workout objects loaded from localStorage.
 *   Each workout is expected to have: { id, date, exercises: Array<Object> }.
 * @param {(idToDelete: string) => void} props.deleteWorkout - Callback invoked with a workout's
 *   id when the user confirms deletion; parent component handles removing it from state/localStorage.
 * @returns {JSX.Element}
 */
const WorkoutLog = ({ savedWorkouts, deleteWorkout, fetchWorkoutLog }) => {

    /**
     * DOM classlist toggles to remove visible scroll bar from log
     */
    useEffect(() => {
        document.documentElement.classList.add("workout-log-page");
        document.body.classList.add("workout-log-page");

        return () => {
            document.documentElement.classList.remove("workout-log-page");
            document.body.classList.remove("workout-log-page");
        };
    }, []);

    /** @type {[number, Function]} Dictates which workout will be deleted */
    const [pendingDelete, setPendingDelete] = useState(null);

    /** @type {[('asc'|'desc'), Function]} Current sort direction applied to savedWorkouts by date. */
    const [sortOrder, setSortOrder] = useState("desc");

    /** @type {[boolean, Function]} Tracks ascending state purely for the sort icon's rotation animation. */
    const [isAscending, setIsAscending] = useState(false);

    /** @type {[boolean, Function]} Controls whether the filter display is open */
    const [openFilter, setOpenFilter] = useState(false);

    /** @type {[Array, Function]} Dictates which workouts will be displayed based on filter */
    const [selectedMonths, setSelectedMonths] = useState([]);

    /** @type {[boolean, Function]} Controls whether edit modal is open */
    const [isEditing, setIsEditing] = useState(false); 
    
    /** @type {[number, Function]} Dictates which workout to edit */
    const [pendingEdit, setPendingEdit] = useState(null);

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
     * Formats duration output into fitness standard Xh Xm Xs display format
     * Converts minutes >= 60 into hours and remaining minutes
     * Original numeric values remain unchanged; formatting is for display only
     * @param {Number} minutes - user input for minutes (300 max)
     * @param {Number} seconds - user input for seconds (59 max)
     * @returns formatted duration string for workout log display purposes only
     */
    const formatDuration = (minutes, seconds) => {
        // If minutes equals or exceeds 60, split hours from minutes
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const newMinutes = minutes % 60;
            return `${hours}h ${newMinutes}m ${seconds}s`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    }

    /**
     * Converts a month string to a number for display conversions
     * @param {String} month - month value for a workout object 
     * @returns Long version of month 
     */
    const formatMonth = (month) => {
        const monthNumber = Number(month);

        if (Number.isNaN(monthNumber)) return "";

        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleString('en-US', { month: 'long' });
    }

    const toggleFilter = () => {
        if (openFilter) {
            setOpenFilter(false);
        } else {
            setOpenFilter(true);
        }
    }

    /**
     * Toggles a single month's presence in the selected-months filter list 
     * If monthId is already selected, it's removed. Otherwise, it's added.
     * Does not filter workouts directly — see `filteredData`, which reacts 
     * to changes in `selectedMonths`
     * @param {String} monthId - two-digit month string to toggle (e.g."01")
     * @returns {void}
     */
    const handleFilterChange = (monthId) => {
       setSelectedMonths((prev) => prev.includes(monthId) ? prev.filter((id) => id !== monthId) : [...prev, monthId]);
    }

    /**
     * True when no specific months are selected, meaning the "All Months" 
     * filter option is active and every workout should be shown.
     * @type {boolean}
     */
    const isAllMonthsSelected = selectedMonths.length === 0;

    /**
     * The distinct set of months (as "MM" strings) present across all saved workouts, 
     * derived from each workout's date. Used to populate the month filter checkboxes — order
     * follows calendar order
     * @type {Array<string>}
     */
    const monthOptions = [...new Set(savedWorkouts.map((workout) => workout.date.split('-')[1]))].sort();

    /**
     * savedWorkouts narrowed down to only those whose month matches one of selectedMonths.
     * When selectedMonths is empty (all months selected), this is just savedWorkouts unfiltered.
     * Recomputed on every render since it depends on savedWorkouts and selectedMonths.
     */ 
    const filteredData = selectedMonths.length === 0 ? savedWorkouts : savedWorkouts.filter((workout) => {
        const workoutMonth = workout.date.split('-')[1]; // Extract MM from YYYY-MM-DD
        return selectedMonths.includes(workoutMonth);
    });

    /**
     * A copy of savedWorkouts (filteredData) sorted by date according to sortOrder.
     * Recomputed on every render since it depends on savedWorkouts and sortOrder;
     * `new Date(a.date)` is safe for comparison purposes even with the UTC quirk,
     * since only relative ordering (not the displayed value) matters here.
     *
     * @type {Array<Object>}
     */
    const sortDates = [...(filteredData || [])].sort((a, b) => {
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

    const editWorkout = (workout) => {
        setPendingEdit(workout);
        setIsEditing(true);
    }
    
    return ( 
        <>
        {/* Change workout-header calls to log-header/something similar */}
            {savedWorkouts?.length === 0 && (
                <div className="workout-modal-overlay">
                    <div className="workout-panel" role="dialog" aria-modal="true" aria-label="Workout Log Results" onClick={(e) => e.stopPropagation()}>                        
                        <div className="empty-log-return">
                            <p>No workouts logged yet.</p>
                            <Link to="/dashboard" className="return-link empty-return">Return to Dashboard</Link>
                        </div>
                    </div>
                </div>
            )}

            {savedWorkouts?.length > 0 && (
                <>
                    <header className="workout-header">

                        <div className="return-container">
                            <Link to="/dashboard" className="return-link" id="workout-return">Return to Dashboard</Link>
                        </div>

                        <h1 className="workout-title">Workout Log</h1>
                    </header>
                    <div className="log-panel">
                        <div className="workout-panel" role="dialog" aria-modal="true" aria-label="Workout Log Results" onClick={(e) => e.stopPropagation()}>
                            <div className="filter-container icon-container">                         
                                <svg width="35px" height="35px" viewBox="0 -0.5 25 25" fill="none" 
                                    xmlns="http://www.w3.org/2000/svg" id="filter" className="filter-icon"
                                    style={{
                                        fill: "currentColor"
                                    }}
                                    onClick={() => toggleFilter()}
                                    >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M11.19 7.84996C11.6934 7.09341 11.5669 6.0823 10.8926 5.47312C10.2183 4.86394 9.19957 4.8404 8.49785 5.41779C7.79614 5.99517 7.62304 6.99935 8.09096 7.77835C8.55887 8.55735 9.52668 8.87624 10.366 8.52796C10.7014 8.38801 10.9881 8.15215 11.19 7.84996Z" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M11.19 18.165C11.6934 17.4084 11.5669 16.3973 10.8926 15.7881C10.2183 15.1789 9.19957 15.1554 8.49785 15.7328C7.79614 16.3102 7.62304 17.3144 8.09096 18.0934C8.55887 18.8724 9.52668 19.1912 10.366 18.843C10.7014 18.703 10.9881 18.4672 11.19 18.165V18.165Z" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M13.81 13.0069C13.3066 12.2504 13.4331 11.2393 14.1074 10.6301C14.7817 10.0209 15.8004 9.99738 16.5021 10.5748C17.2039 11.1522 17.377 12.1563 16.909 12.9353C16.4411 13.7143 15.4733 14.0332 14.634 13.6849C14.2986 13.545 14.0119 13.3091 13.81 13.0069V13.0069Z" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M11.5 6.07593C11.0858 6.07593 10.75 6.41171 10.75 6.82593C10.75 7.24014 11.0858 7.57593 11.5 7.57593V6.07593ZM19.5 7.57593C19.9142 7.57593 20.25 7.24014 20.25 6.82593C20.25 6.41171 19.9142 6.07593 19.5 6.07593V7.57593ZM7.827 7.57593C8.24121 7.57593 8.577 7.24014 8.577 6.82593C8.577 6.41171 8.24121 6.07593 7.827 6.07593V7.57593ZM5.5 6.07593C5.08579 6.07593 
                                        4.75 6.41171 4.75 6.82593C4.75 7.24014 5.08579 7.57593 5.5 7.57593V6.07593ZM11.5 16.3919C11.0858 16.3919 10.75 16.7277 10.75 17.1419C10.75 17.5561 11.0858 17.8919 11.5 17.8919V16.3919ZM19.5 17.8919C19.9142 17.8919 20.25 17.5561 20.25 17.1419C20.25 16.7277 19.9142 16.3919 19.5 16.3919V17.8919ZM7.827 17.8919C8.24121 17.8919 8.577 17.5561 8.577 17.1419C8.577 16.7277 
                                        8.24121 16.3919 7.827 16.3919V17.8919ZM5.5 16.3919C5.08579 16.3919 4.75 16.7277 4.75 17.1419C4.75 17.5561 5.08579 17.8919 5.5 17.8919V16.3919ZM13.5 12.7339C13.9142 12.7339 14.25 12.3981 14.25 11.9839C14.25 11.5697 13.9142 11.2339 13.5 11.2339V12.7339ZM5.5 11.2339C5.08579 11.2339 4.75 11.5697 4.75 11.9839C4.75 12.3981 5.08579 12.7339 5.5 12.7339V11.2339ZM17.173 
                                        11.2339C16.7588 11.2339 16.423 11.5697 16.423 11.9839C16.423 12.3981 16.7588 12.7339 17.173 12.7339V11.2339ZM19.5 12.7339C19.9142 12.7339 20.25 12.3981 20.25 11.9839C20.25 11.5697 19.9142 11.2339 19.5 11.2339V12.7339ZM11.5 7.57593H19.5V6.07593H11.5V7.57593ZM7.827 6.07593H5.5V7.57593H7.827V6.07593ZM11.5 17.8919H19.5V16.3919H11.5V17.8919ZM7.827 
                                        16.3919H5.5V17.8919H7.827V16.3919ZM13.5 11.2339H5.5V12.7339H13.5V11.2339ZM17.173 12.7339H19.5V11.2339H17.173V12.7339Z"/>
                                </svg>
                                {openFilter && (
                                    <>
                                        <div className="filter-label-container" onClick={() => setOpenFilter(false)}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={isAllMonthsSelected}
                                                    onChange={() => setSelectedMonths([])}
                                                />
                                                All Months
                                            </label>
                                            {monthOptions.map((monthId) => (
                                                <label key={monthId}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedMonths.includes(monthId)}
                                                        onChange={() => handleFilterChange(monthId)}
                                                    />
                                                    {formatMonth(monthId)}
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}
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
                                                {exercise.type === "strength" && (
                                                    <>
                                                        <p>Type: {exercise.type}</p>
                                                        <p>Exercise: {exercise.name}</p>
                                                        <p>Weight (lbs): {exercise.weight}</p>
                                                        <p>Sets: {exercise.sets}</p>
                                                        <p>Reps: {exercise.reps}</p>                                                    
                                                    </>
                                                )}
                                                {exercise.type === "duration" && (
                                                    <>
                                                        <p>Type: {exercise.type}</p>
                                                        <p>Exercise: {exercise.name}</p>
                                                        <p>Time: {formatDuration(exercise.duration_minutes, exercise.duration_seconds)}</p>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="secondary-button" id="edit-workout-button" onClick={() => editWorkout(workout)}>Edit Workout</button>
                                    {pendingEdit && pendingEdit.id === workout.id && isEditing && (
                                        <EditWorkout
                                            workout={pendingEdit}
                                            setIsEditing={setIsEditing}
                                            fetchWorkoutLog={fetchWorkoutLog}
                                        />
                                    )}
                                    <button type="button" className="secondary-button delete-workout" onClick={() => setPendingDelete(workout.workout_id)}>Delete Workout</button>
                                    {/* Delete confirmation modal window */}
                                    {pendingDelete === workout.workout_id && (
                                        <div className="workout-modal-overlay delete-overlay">
                                            <p>Delete workout?</p>
                                            <button type="button" className="secondary-button confirm-delete-workout" 
                                                onClick={() => {
                                                deleteWorkout(pendingDelete);
                                                setPendingDelete(null);
                                            }}>
                                                Delete Workout
                                            </button>
                                            <button type="button" className="secondary-button" onClick={() => setPendingDelete(null)}>Cancel</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
     );
}
 
export default WorkoutLog;