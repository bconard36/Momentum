import { mockWorkouts } from "../mock/mockWorkouts";

const WorkoutFormPreview = () => {
  const sampleWorkout = mockWorkouts[2];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split("-").map(Number);
    const safeDate = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(safeDate);
  };

  return (
    <div className="preview-workout-panel preview workout-overlay">
      <h3>Review your Progress</h3>
      <div className="preview-mock-form">
        <p className="preview-date-header">{formatDate(sampleWorkout.date)}</p>

        <div className="preview-exercise-list">
          {sampleWorkout.exercises.map((ex, i) => (
            <div className="preview-exercise-item" key={i}>
              <p className="preview-exercise-name">Exercise: {ex.name}</p>
              {ex.type === "strength" ? (
                <>
                  <p>Type: {ex.type}</p>
                  <p>
                    {ex.sets} sets &times; {ex.reps} reps @ {ex.weight} lb
                  </p>
                </>
              ) : (
                <>
                  <p>Type: {ex.type}</p>
                  <p>
                    Time: {ex.duration_minutes}m {ex.duration_seconds}s
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutFormPreview;
