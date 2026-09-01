import { Link } from "react-router";
import ThirtyDayCount from "./ThirtyDayCount";
import WorkoutStreak from "./WorkoutStreak";
const Analytics = ({ workouts }) => {
  return (
    <>
      <div className="return-container">
        <Link to="/dashboard" className="return-link" id="analysis-return">
          Return to Dashboard
        </Link>
      </div>
      <div className="analysis-header-container">
        <h1>Performance Analysis</h1>
        <p>Take a look under the hood of your workouts</p>
      </div>
      <ThirtyDayCount workouts={workouts} />
      <WorkoutStreak workouts={workouts} />
    </>
  );
};

export default Analytics;
