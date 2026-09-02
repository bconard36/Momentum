import { mockWorkouts } from "../mock/mockWorkouts";

const AnalyticsPreview = () => {
  /**
   * Thirty Day Count Logic for Analytics Preview Component
   */
  const exercises = mockWorkouts.flatMap((workout) => workout.exercises);

  const totalExercises = exercises.length;

  const endDate = new Date("2026-08-31").setHours(0, 0, 0, 0);

  const pastDate = new Date(endDate);
  pastDate.setDate(pastDate.getDate() - 30);
  pastDate.setHours(0, 0, 0, 0);

  const thirtyDayWorkouts = mockWorkouts.filter((workout) => {
    const [year, month, day] = workout.date.split("-");
    // Build a date object directly from time zone components from workout object
    // Mixing new Date(string) and new Date(year, month, day) leads to 2 different time zone behaviors.
    const workoutDate = new Date(Number(year), Number(month) - 1, Number(day));

    // Ensure inclusive bounds so a workout logged today and one logged exactly 30 days ago will appear
    return workoutDate >= pastDate && workoutDate <= endDate;
  });

  const strengthExercises = exercises.filter(
    (exercise) => exercise.type === "strength",
  );
  const durationExercise = exercises.filter(
    (exercise) => exercise.type === "duration",
  );

  const strengthPercentage =
    strengthExercises.length === 0
      ? 0
      : Math.round((strengthExercises.length / totalExercises) * 100);
  const durationPercentage =
    durationExercise.length === 0
      ? 0
      : Math.round((durationExercise.length / totalExercises) * 100);

  /**
   * Streak Calculation Logic for Analytics Preview Component
   */
  const day_milliseconds = 24 * 60 * 60 * 1000;
  const workoutDates = mockWorkouts.map((workout) => workout.date);

  // Normalize to ignore time boundaries
  const normalizedDates = workoutDates.map((date) => {
    const [year, month, day] = date.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)).setHours(
      0,
      0,
      0,
      0,
    );
  });

  // Sort dates in desc order (most recent first)
  const uniqueDates = [...new Set(normalizedDates)]; // Remove duplicates
  uniqueDates.sort((a, b) => b - a);

  const today = uniqueDates[0]; // Use the most recent workout date as today
  const yesterday = today - day_milliseconds; // 1 day in milliseconds

  let currentStreak = 0;
  let expectedDate = today;

  currentStreak = uniqueDates[0] === today ? 1 : 0;
  expectedDate =
    uniqueDates[0] === today ? yesterday : today - day_milliseconds;

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
    <>
      <div className="analytics-header-container">
        <h1>Analytics for Your Workouts</h1>
        <p>
          30 Day Overview, Exercise Type Splits, and Workout Streak Tracking
        </p>
      </div>
      <div className="analysis-container">
        <div className="thirty-day-total">
          <p className="analysis-header">Total Workouts in the last 30 days:</p>
          <span>{thirtyDayWorkouts.length}</span>
        </div>
      </div>
      <div className="analysis-container">
        <div className="workout-streak-header">
          <p className="analysis-header">Current Workout Streak:</p>
          <span>{currentStreak}</span>
        </div>
      </div>
      <div className="analysis-container">
        <div className="exercise-split-content">
          <p>
            Total Exercises:{" "}
            <span className="exercise-metric count">{exercises.length}</span>
          </p>
          <p>
            Strength Exercises:{" "}
            <span className="exercise-metric strength">
              {strengthExercises.length} ({strengthPercentage}%)
            </span>
          </p>
          <p>
            Duration Exercises:{" "}
            <span className="exercise-metric duration">
              {durationExercise.length} ({durationPercentage}%)
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default AnalyticsPreview;
