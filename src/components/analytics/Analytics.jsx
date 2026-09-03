import { Link } from "react-router";
import ThirtyDayCount from "./ThirtyDayCount";
import WorkoutStreak from "./WorkoutStreak";
import ExerciseSplits from "./ExerciseSplits";
/**
 * Analytics Component
 * Parent component for different metrics and analysis based on fetched user workout data
 * @param {Object<Array>} workouts - saved user workouts
 * @returns {JSXElement} - analytics page with specific metrics displayed
 */
const Analytics = ({ workouts }) => {
  return (
    <>
      <div className="return-container">
        <Link to="/dashboard" className="return-link" id="analysis-return">
          Return to Dashboard
        </Link>
      </div>
      <div className="analytics-header-container">
        <h1>Performance Analysis</h1>
      </div>
      <div className="analytics-grid">
        <ThirtyDayCount workouts={workouts} />
        <WorkoutStreak workouts={workouts} />
        <ExerciseSplits workouts={workouts} />
      </div>
    </>
  );
};

export default Analytics;
