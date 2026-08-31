import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useState, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import Calculator from "./components/CalorieTrack/components/CalculatorForm";
import WorkoutForm from "./components/WorkoutForm";
import NotFound from "./components/NotFound";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { supabase } from "./utils/supabaseClient";
import WorkoutLog from "./components/WorkoutLog";
import LandingPage from "./components/LandingPage";

/**
 * Home Route Component
 * Checks whether a user currently has an authenticated Supabase session.
 * Redirects authenticated users to their dashboard and displays the sign-in
 * component for unauthenticated users.
 * Displays a loading state while authentication is being checked.
 * @returns {JSX.Element} Loading state, dashboard redirect, or sign-in component
 */
function HomeRedirect() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthenticated(!!user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-message-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SignIn />;
}

function App() {
  /**
   * @type {[Array<Object>, Function]} All saved workouts, initialized as an empty array
   * Each workout: { id, date, exercises: Array<Object> }.
   */
  const [savedWorkouts, setSavedWorkouts] = useState([]);

  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);
  const [workoutError, setWorkoutError] = useState(null);

  /**
   * Fetches workout history from Supabase
   * Invokes a remote procedure call (rpc) that executes a custom SQL query
   * @returns {[Array<Object>]} - saved workouts object returned from Supabase
   */
  const fetchWorkoutLog = async () => {
    setIsLoadingWorkouts(true);
    setWorkoutError(null);

    try {
      // Custom get_user_workouts SQL function in Supabase
      const { data, error } = await supabase.rpc("get_user_workouts");

      if (error) {
        throw error;
      }
      // Set saved workouts to data returned from SQL function
      setSavedWorkouts(data ?? []);
    } catch (error) {
      console.error(`Error fetching workouts: ${error}`);
      setWorkoutError("Unable to load your workouts. Please try again.");
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  // Verify the authenticated user and listed for auth state changes
  // Fetch the workout log once a user is authenticated
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, _session) => {
        // re-verify instead of trusting session directly
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchWorkoutLog();
    }
  }, [user]);

  /**
   * Deletes a specified workout from the workout log
   * @param {String} idToDelete - randomly generated UUID string for workout to delete from log
   * @returns {void}
   */
  const deleteWorkout = async (idToDelete) => {
    try {
      // Custom delete_workout function in Supabase
      const { error: deleteError } = await supabase.rpc("delete_workout", {
        p_workout_id: idToDelete,
      });

      if (deleteError) {
        throw deleteError;
      }
      // If no error, no data to return — simply fetchWorkoutLog()
      fetchWorkoutLog();
      return { success: true };
    } catch (error) {
      // Custom error handling here
      console.error(`Error deleting workout: ${error}`);
      return {
        success: false,
        error: "Unable to delete this workout. Please try again.",
      };
    }
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<HomeRedirect />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <WorkoutForm fetchWorkoutLog={fetchWorkoutLog} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <WorkoutLog
                  savedWorkouts={savedWorkouts}
                  deleteWorkout={deleteWorkout}
                  fetchWorkoutLog={fetchWorkoutLog}
                  isLoading={isLoadingWorkouts}
                  workoutError={workoutError}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
