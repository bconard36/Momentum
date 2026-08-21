import { BrowserRouter, Routes, Route } from 'react-router'
import { useState, useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './components/Dashboard'
import Calculator from './components/CalorieTrack/components/CalculatorForm'
import WorkoutForm from './components/WorkoutForm'
import NotFound from './components/NotFound'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import { supabase } from './utils/supabaseClient'
import WorkoutLog from './components/WorkoutLog'

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
    }

    // Fetch the workout log with useEffect()
    useEffect(() => {
      fetchWorkoutLog();
    }, []);

    /**
     * Deletes a specified workout from the workout log  
     * @param {String} idToDelete - randomly generated UUID string for workout to delete from log 
     * @returns {void} 
     */
    const deleteWorkout = async (idToDelete) => {
      try {
        // Custom delete_workout function in Supabase
        const { error: deleteError } = await supabase.rpc("delete_workout", {
          p_workout_id: idToDelete
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
            error: "Unable to delete this workout. Please try again."
          };
      }
    };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <SignIn /> } />
          <Route path="/sign-up" element={ <SignUp /> } />
          <Route path="/dashboard" element={ 
                                <ProtectedRoute>
                                  <Dashboard 
                                    /> 
                                </ProtectedRoute>
                                  } />
          <Route path="/workouts" element={ 
                                <ProtectedRoute>
                                  <WorkoutForm 
                                    fetchWorkoutLog={fetchWorkoutLog}
                                    />
                                </ProtectedRoute>            
                                  } />
          <Route path="/logs" element={
                                <ProtectedRoute>
                                  <WorkoutLog
                                    savedWorkouts={savedWorkouts} 
                                    deleteWorkout={deleteWorkout}
                                    fetchWorkoutLog={fetchWorkoutLog}
                                    isLoading={isLoadingWorkouts}
                                    workoutError={workoutError}
                                  />
                                </ProtectedRoute>
          } />
          <Route path="/calculator" element={ <Calculator /> } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
