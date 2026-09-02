const WorkoutSplits = ({ workouts }) => {
  /**
   * Loops through workouts and then exercises to extract exercise data
   * @param {Object<Array>} workouts - mock workout data
   * @param {String} type - workout type
   * @returns {Object<Array> | null} - exercise list
   */
  const exercises = (workouts) => {
    for (const workout of workouts) {
      for (const exercise of workout.exercises) {
        return exercise;
      }
    }
    return null;
  };

  return <div>{exercises}</div>;
};

export default WorkoutSplits;
