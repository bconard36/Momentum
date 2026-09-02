const WorkoutSplits = ({ workouts }) => {
  /**
   * Loops through workouts and then exercises to extract exercise data
   * @param {Object<Array>} workouts - mock workout data
   * @param {String} type - workout type
   * @returns {Object<Array> | null} - exercise list
   */
  const exercises = (workouts) => {
    const exercisesList = [];
    for (const workout of workouts) {
      for (const exercise of workout.exercises) {
        exercisesList.push(exercise);
      }
    }
    return exercisesList;
  };

  const exerciseList = exercises(workouts);

  const strengthCount = exerciseList.filter(
    (exercise) => exercise.type === "strength",
  ).length;
  const durationCount = exerciseList.filter(
    (exercise) => exercise.type === "duration",
  ).length;

  // Ensure null / divide by zero safeguards with the percentages
  const strengthPercentage =
    exerciseList.length === 0
      ? 0
      : Math.round((strengthCount / exerciseList.length) * 100);
  const durationPercentage =
    exerciseList.length === 0
      ? 0
      : Math.round((durationCount / exerciseList.length) * 100);

  if (exerciseList.length === 0) {
    return <p>No exercises logged yet.</p>;
  }

  return (
    <div>
      <p>Total Exercises: {exerciseList.length}</p>
      <p>
        Strength Exercises: {strengthCount} ({strengthPercentage}%)
      </p>
      <p>
        Duration Exercises: {durationCount} ({durationPercentage}%)
      </p>
    </div>
  );
};

export default WorkoutSplits;
