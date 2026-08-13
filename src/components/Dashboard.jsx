import { Link, useNavigate } from "react-router";
import WorkoutLog from "./WorkoutLog";
import { supabase } from "../utils/supabaseClient";

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
/**
 * Dashboard component constructor
 * @param {Array<Object>} savedWorkouts - array of saved workout objects 
 * @param {Function} deleteWorkout - deletes a specified workout from the log
   
 * @returns {JSX.Element}
 */
const Dashboard = ({ savedWorkouts, deleteWorkout }) => {

    // Initialize navigation hook 
    const logOutNav = useNavigate();

    /**
     * Sign Out Handler 
     * Calls auth.signOut() to remove a user from the browser session / log them out 
     * Redirects to sign-in component on successful sign out 
      
     * @returns {Object} - sign out/error promise
     */
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut({ 
                // Local scope - signs out current session/browser tab only
                // Global scope logs user out of every tab/browser/device. 
                scope: "local" 
            }); 

            if (error) {
                console.log("Error signing out:", error);
            } else {
                console.log("Signed out!");
                logOutNav("/sign-in", { replace: true });
            }
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    return (
        <>
            <div className="dashboard">
                <div className="user-icon-container">
                    <svg width="35px" height="35px" viewBox="0 0 16 16" style={{
                            fill: "currentColor"
                        }} xmlns="http://www.w3.org/2000/svg" onClick={signOut}>
                        <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 
                            5 4C5 5.65685 6.34315 7 8 7Z" />
                        <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
                    </svg>
                </div>
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
                            Log today's session and review past workouts.
                        </span>
                    </Link>

                    <Link to="/calculator" className="nav-card">
                        <span className="nav-card-label">Fitness Calculator</span>
                        <span className="nav-card-description">
                            Check your BMI, BMR, and daily calorie targets.
                        </span>
                    </Link>
    
                    <div className="dashboard-log">
                        <span className="nav-card-label">Workout History</span>
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