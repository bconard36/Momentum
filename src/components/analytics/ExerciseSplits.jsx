/**
 * Renders the exercise splits for the user based on their saved workouts
 * Calculates total workout count, and exercise type splits (strength vs duration)
 * @param {Object<Array>} workouts - saved user workouts
 * @returns
 */
const ExerciseSplits = ({ workouts }) => {
  // Use flatMap() to flatten nested workout exercises arrays into one exercises array
  const exercises = workouts.flatMap((workout) => workout.exercises);

  // Filter out strength and duration exercises into their own arrays
  const strengthCount = exercises.filter(
    (exercise) => exercise.type === "strength",
  ).length;
  const durationCount = exercises.filter(
    (exercise) => exercise.type === "duration",
  ).length;

  // Ensure null / divide by zero safeguards with the percentages
  const strengthPercentage =
    exercises.length === 0
      ? 0
      : Math.round((strengthCount / exercises.length) * 100);
  const durationPercentage =
    exercises.length === 0
      ? 0
      : Math.round((durationCount / exercises.length) * 100);

  if (exercises.length === 0) {
    return <p>No exercises logged yet.</p>;
  }

  return (
    <div className="analysis-container">
      <div className="exercise-split-content">
        <p>
          Total Exercises:{" "}
          <span className="exercise-metric count">{exercises.length}</span>
        </p>
        <p>
          Strength Exercises:{" "}
          <span className="exercise-metric strength">
            {strengthCount} ({strengthPercentage}%)
          </span>
        </p>
        <p>
          Duration Exercises:{" "}
          <span className="exercise-metric duration">
            {durationCount} ({durationPercentage}%)
          </span>
        </p>
      </div>
    </div>
  );
};

export default ExerciseSplits;
