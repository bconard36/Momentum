/**
 * Workout Streak Component
 * Calculates the current streak of consecutive days with workouts completed
 * @param {Object<Array>} workouts - saved user workouts
 * @returns {JSXElement}
 */
const WorkoutStreak = ({ workouts }) => {
  // Store millisecond constant for one day
  const day_milliseconds = 24 * 60 * 60 * 1000;
  // Store workout dates
  const workoutDates = workouts.map((workout) => {
    const dateOnly = workout.date;
    return dateOnly;
  });

  if (!workoutDates || workoutDates.length === 0) {
    return <p>No workouts logged yet.</p>;
  }

  // Normalize to ignore time boundaries
  const normalizedDates = workoutDates.map((date) => {
    const [year, month, day] = date.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  });

  // Sort dates in desc order (most recent first)
  const uniqueDates = [...new Set(normalizedDates)]; // Remove duplicates
  uniqueDates.sort((a, b) => b - a);

  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - day_milliseconds; // 1 day in milliseconds

  let currentStreak = 0;
  let expectedDate = today;

  // Check if user has workout out today or yesterday
  if (uniqueDates[0] === today) {
    currentStreak = 1;
    expectedDate = yesterday;
  } else if (uniqueDates[0] === yesterday) {
    currentStreak = 1;
    expectedDate = yesterday - day_milliseconds;
  } else {
    return <p>No workouts logged for the past two days.</p>;
  }

  // Loop through the rest of the dates to find consecutive days
  for (let i = 1; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === expectedDate) {
      currentStreak++;
      expectedDate -= day_milliseconds; // Move to the previous day
    } else {
      break; // Gap in streak found, loop ends
    }
  }
  return (
    <div className="analysis-container">
      <div className="workout-streak-header">
        <p className="analysis-header">Current Workout Streak:</p>
        <span>{currentStreak}</span>
      </div>
    </div>
  );
};

export default WorkoutStreak;
