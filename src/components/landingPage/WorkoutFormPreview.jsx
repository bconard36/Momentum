import { mockWorkouts } from "../../mock/mockWorkouts";
/**
 * Workout Form Preview Component
 * Rendered on the landing page along with other preview components
 * Mock workout data imported and used for mock form rendering
 * @returns {JSXElement} - workout form preview for the landing page
 */
const WorkoutFormPreview = () => {
  // Mapping through workout data returns an array of arrays
  // An array of workouts with nested exercise arrays within each
  // Need to return one array of every exercise, regardless of workout
  /**
   * Loops through workouts and then exercises to extract exercise data
   * @param {Object<Array>} workouts - mock workout data
   * @param {String} type - workout type
   * @returns {Object<Array> | null} - exercise list
   */
  const findExerciseByType = (workouts, type) => {
    for (const workout of workouts) {
      for (const exercise of workout.exercises) {
        if (exercise.type === type) {
          return exercise;
        }
      }
    }
    return null;
  };

  const strengthExercise = findExerciseByType(mockWorkouts, "strength");

  return (
    <div className="preview preview-workout-form">
      <div className="preview-workout-form-header">
        <h3>Built for how you actually train</h3>
        <p>Fields adapt automatically based on workout type.</p>
      </div>
      <div className="mock-tabs">
        <div className="mock-tab mock-tab-active">Strength</div>
        <div className="mock-tab">Duration</div>
      </div>

      <div className="preview-mock-form">
        <div className="mock-field">
          <label>Exercise Name</label>
          <div className="mock-input" id="preview-exercise-input">
            {strengthExercise.name}
          </div>
        </div>
        <div className="mock-field-row">
          <div className="mock-field">
            <label>Sets</label>
            <div className="mock-input">{strengthExercise.sets}</div>
          </div>
          <div className="mock-field">
            <label>Reps</label>
            <div className="mock-input">{strengthExercise.reps}</div>
          </div>
          <div className="mock-field">
            <label>Weight</label>
            <div className="mock-input">{strengthExercise.weight} lb</div>
          </div>
        </div>
      </div>
      <div className="mock-form-buttons">
        <button className="preview-mock-form-button">
          Add Another Exercise
        </button>
        <button className="preview-mock-form-button">Save Workout</button>
      </div>
    </div>
  );
};

export default WorkoutFormPreview;
