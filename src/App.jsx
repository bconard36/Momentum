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

    /**
     * Fetches workout history from Supabase
     * Invokes a remote procedure call (rpc) that executes a custom SQL query
     * @returns {[Array<Object>]} - saved workouts object returned from Supabase
     */
    const fetchWorkoutLog = async () => {

      try {
        // Custom get_user_workouts SQL function in Supabase 
        const { data, error } = await supabase.rpc("get_user_workouts");
      
        if (error) {
          console.error("error fetching workouts: ", error.message);
          return;
        }
        // Set saved workouts to data returned from SQL function
        setSavedWorkouts(data);

      } catch (error) {
        console.error(error);
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
          // Custom error handling here
            console.error("Error deleting workout: ", deleteError);
            return;
        }

        // If no error, no data to return — simply fetchWorkoutLog()
        fetchWorkoutLog();
      } catch (error) {
        // Custom error handling here 
          console.error(error);
      }
      
    }

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
