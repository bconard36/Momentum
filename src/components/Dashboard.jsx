import { Link } from "react-router";
import WorkoutLog from "./WorkoutLog";

// ============================================================
// Dashboard.jsx
// Landing page for the app. Its only job is navigation: two cards,
// each linking to a real route (/workouts and /calculator) via
// React Router's <Link>, rather than managing view state locally.
//
// IMPORTANT — this component assumes it's rendered somewhere inside
// a <BrowserRouter> (v8 package: "react-router", not the old
// "react-router-dom" — that package doesn't exist in React Router v8).
// That wrapper isn't set up yet; it needs to go in main.jsx or App.jsx
// alongside <Routes>/<Route> definitions for "/workouts" and
// "/calculator" once those components exist. Until that wrapper is in
// place, this component will throw an error if rendered on its own.
//
// CalorieTrack (the fitness calculator) is intended to live at the
// "/calculator" route as a self-contained tool — no changes needed to
// its own internals, it just gets mounted at that route once routing
// is wired up.
// ============================================================

const Dashboard = ({ savedWorkouts, deleteWorkout }) => {
    return (
        <>
            <div className="dashboard">
                <header className="dashboard-header">
                    <h1 className="dashboard-title">Momentum</h1>
                    <p className="dashboard-subtitle">
                        Log your workouts, track your progress, and check your numbers — all in one place.
                    </p>
                </header>

                <nav className="dashboard-nav" aria-label="Main sections">
                    <Link to="/workouts" className="nav-card">
                        <span className="nav-card-label">Workouts</span>
                        <span className="nav-card-description">
                            Log today's session and review your training history.
                        </span>
                    </Link>

                    <Link to="/calculator" className="nav-card">
                        <span className="nav-card-label">Fitness Calculator</span>
                        <span className="nav-card-description">
                            Check your BMI, BMR, and daily calorie targets.
                        </span>
                    </Link>
    
                    <div className="dashboard-log">
                        <WorkoutLog 
                            savedWorkouts={savedWorkouts}
                            deleteWorkout={deleteWorkout}
                        />
                    </div>
                    
                </nav>
            </div>
        </>
    );
}

export default Dashboard;