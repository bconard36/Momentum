import { mockWorkouts } from "../mock/mockWorkouts";
/**
 * Displays a summary of workout analytics based on mock workout data.
 * Calculates a total number of workouts in the last 30 days, a current workout streak, and exercise type splits
 * @returns {JSXElement}
 *
 */
const AnalyticsPreview = () => {
  /**
   * Thirty Day Count Logic for Analytics Preview Component
   * Logic borrowed from ThirtyDayCount component, modified to use mock data
   */
  const exercises = mockWorkouts.flatMap((workout) => workout.exercises);

  const totalExercises = exercises.length;

  const endDate = new Date("2026-08-31").setHours(0, 0, 0, 0);

  const pastDate = new Date(endDate);
  pastDate.setDate(pastDate.getDate() - 30);
  pastDate.setHours(0, 0, 0, 0);

  const thirtyDayWorkouts = mockWorkouts.filter((workout) => {
    const [year, month, day] = workout.date.split("-");
    const workoutDate = new Date(Number(year), Number(month) - 1, Number(day));

    return workoutDate >= pastDate && workoutDate <= endDate;
  });

  /**
   * Logic for exercise type splits
   */
  const strengthExercises = exercises.filter(
    (exercise) => exercise.type === "strength",
  );
  const durationExercise = exercises.filter(
    (exercise) => exercise.type === "duration",
  );

  /**
   * Calculations for exercise type split percentages
   */
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
   * Logic borrowed from WorkoutStreak component, modified to use mock data
   * Today initialized as the first workout date in the mockWorkouts array to ensure a streak is present for testing purposes
   */
  const day_milliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
  // Extract dates and normalize to ignore time boundaries
  const normalizedDates = mockWorkouts.map((workout) => {
    const [year, month, day] = workout.date.split("-");

    return new Date(Number(year), Number(month) - 1, Number(day)).setHours(
      0,
      0,
      0,
      0,
    );
  });

  // Remove duplicates and sort dates in desc order
  const uniqueDates = [...new Set(normalizedDates)].sort((a, b) => b - a);
  let currentStreak = 0;
  let expectedDate = uniqueDates[0];

  // Loop through the rest of the dates to find consecutive days
  for (const date of uniqueDates) {
    if (date === expectedDate) {
      currentStreak++;
      expectedDate -= day_milliseconds;
    } else {
      break;
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
