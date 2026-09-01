/**
 * Workout Streak Component
 * Written to start the analysis logic - not married to a separate component for this
 * Calculates the current workout streak based on a count of the stored workouts
 * @param {Object<Array>} workouts - saved user workouts
 * @returns
 */
const WorkoutStreak = ({ workouts }) => {
  /**
   * Calculates a date 30 days in the past
   * Initializes today as a new Date object
   * Sets the date to a dynamic date - 30 days in the past
   * @returns a date string
   */
  const getPastDate = () => {
    // Store today as a new date object
    const today = new Date();
    // Set the date as 30 days ago
    today.setDate(today.getDate() - 30);
    // Return the updated date object
    return today;
  };

  // Assume workouts array, each object with a workout.date field, is already fetched
  // Count the total number of workouts within the last 30 days
  const thirtyDayTotal = workouts.filter((workout) => {
    const workoutDate = new Date(workout.date);
    if (workoutDate >= getPastDate()) {
      return workout;
    }
  });

  return (
    <div className="workout-streak-header">
      30 day total: {thirtyDayTotal.length}
    </div>
  );
};

export default WorkoutStreak;
