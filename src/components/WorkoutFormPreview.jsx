import { mockWorkouts } from "../mock/mockWorkouts";

const WorkoutFormPreview = () => {
  const sampleWorkout = mockWorkouts[2];
  const workoutDate = sampleWorkout.date;

  return (
    <div className="preview preview--workout-form">
      <h3>Log a workout in seconds</h3>
      <div className="preview__mock-form">
        <div className="mock-field">
          <label>Date</label>
          <div className="mock-input">{workoutDate}</div>
        </div>
        {sampleWorkout.exercises.map((ex, i) => (
          <div className="mock-exercise" key={i}>
            <strong>{ex.name}</strong>
            {ex.type === "strength" ? (
              <span>
                {ex.sets} &times; {ex.reps} @ {ex.weight} lb
              </span>
            ) : (
              <span>
                {ex.duration_minutes}m {ex.duration_seconds}s
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutFormPreview;
