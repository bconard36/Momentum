/**
 * Thirty Day Total Component
 * Written to start the analysis logic - not married to a separate component for this
 * Calculates the current thirty day running count of total workouts completed
 * @param {Object<Array>} workouts - saved user workouts
 * @returns
 */
const ThirtyDayCount = ({ workouts }) => {
  // Get today's date in the user's local timezone with the time removed
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the date 30 days ago
  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - 30);

  // Assume workouts array, each object with a workout.date field, is already fetched
  // Count the total number of workouts within the last 30 days
  const thirtyDayTotal = workouts.filter((workout) => {
    const [year, month, day] = workout.date.split("-");
    // Build a date object directly from time zone components from workout object
    // Mixing new Date(string) and new Date(year, month, day) leads to 2 different time zone behaviors.
    const workoutDate = new Date(Number(year), Number(month) - 1, Number(day));

    // Ensure inclusive bounds so a workout logged today and one logged exactly 30 days ago will appear
    return workoutDate >= pastDate && workoutDate <= today;
  });

  return (
    <div className="workout-streak-header">
      30 day total: {thirtyDayTotal.length}
    </div>
  );
};

export default ThirtyDayCount;
