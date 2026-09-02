import { Link, useNavigate } from "react-router";
import { supabase } from "../utils/supabaseClient";
import { useState } from "react";
import Header from "./Header";

// ============================================================
// Dashboard.jsx
//
// Dashboard landing page for Momentum. Provides navigation to the Workouts
// and Fitness Calculator routes, a button to display workout history (when applicable),
// and handles local Supabase authentication sign-out
// ============================================================
/**
 * Dashboard component 
 * @param {Array<Object>} savedWorkouts - array containing authenticated user's saved workouts from Supabase
 * @param {Function} deleteWorkout - function used to remove a specified workout from the workout log
   
 * @returns {JSX.Element} - Dashboard component
 */
const Dashboard = () => {
  // Initialize navigation hook
  const logOutNav = useNavigate();

  // Initialize state of user menu
  const [isUserOpen, setIsUserOpen] = useState(false);

  /**
   * Toggles open/closed state of user menu
   */
  const toggleUserMenu = () => {
    if (isUserOpen) {
      setIsUserOpen(false);
    } else {
      setIsUserOpen(true);
    }
  };

  /**
     * Sign Out Handler 
     * Calls Supabase Auth signOut() to end the user's current session. 
     * On successful sign-out, redirects the user to the sign-in route.
      
     * @returns {Promise<void>} - Resolves after the sign-out requests completes
     */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({
        // Local scope signs the user out of the current session,
        // without terminating the user's other active sessions
        scope: "local",
      });

      if (error) {
        console.log("Error signing out:", error);
      } else {
        setIsUserOpen(false);
        logOutNav("/", { replace: true });
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <div className="dashboard">
        <div className="user-icon-container">
          <svg
            viewBox="0 0 16 16"
            style={{
              fill: "currentColor",
            }}
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => toggleUserMenu()}
          >
            <path
              d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 
                            5 4C5 5.65685 6.34315 7 8 7Z"
            />
            <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
          </svg>
        </div>
        {isUserOpen && (
          <div
            className="user-menu-container"
            onClick={() => setIsUserOpen(false)}
          >
            <nav className="user-menu">
              <ul>
                <li className="user-menu-item" onClick={signOut}>
                  Sign Out
                </li>
              </ul>
            </nav>
          </div>
        )}
        {/* Insert Dynamic Header Component with Logged In User's Name Included */}
        <Header />

        <nav className="dashboard-nav" aria-label="Main sections">
          <Link to="/workouts" className="nav-card nav-card-workouts">
            <span className="nav-card-label">Workouts</span>
            <span className="nav-card-description">
              Log today's session and review past workouts.
            </span>
          </Link>

          <Link to="/calculator" className="nav-card nav-card-calculator">
            <span className="nav-card-label">Fitness Calculator</span>
            <span className="nav-card-description">
              Check your BMI, BMR, and daily calorie targets.
            </span>
          </Link>

          <Link to="/logs" className="nav-card nav-card-history">
            <span className="nav-card-label">Workout History</span>
            <span className="nav-card-description">
              Review your past workout logs and progress.
            </span>
          </Link>

          <Link to="/analysis" className="nav-card nav-card-analysis">
            <span className="nav-card-label">Workout Analysis</span>
            <span className="nav-card-description">
              Review metrics and stats of your past workouts
            </span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Dashboard;
