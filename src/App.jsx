import { BrowserRouter, Routes, Route } from 'react-router'
import { useState } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './components/Dashboard'
import Calculator from './components/CalorieTrack/components/CalculatorForm'
import WorkoutForm from './components/WorkoutForm'
import NotFound from './components/NotFound'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'

// Mon 8/17/26
// App still reads saved workouts from localStorage
// Need to fetch from DB instead

function App() {
    /**
     * @type {[Array<Object>, Function]} All saved workouts, hydrated from localStorage on mount.
     * Each workout: { id, date, exercises: Array<Object> }.
     */
    const [savedWorkouts, setSavedWorkouts] = useState(() => {
        const saved = localStorage.getItem("workouts");
        // Return parsed, saved workouts if they exist, otherwise an empty array
        return saved ? JSON.parse(saved) : [];
    });

    /**
     * Deletes a specified workout from the workout log  
     * @param {String} idToDelete - randomly generated UUID string for workout to delete from log 
     * @returns {void} 
     */
    const deleteWorkout = (idToDelete) => {
      const updatedWorkouts = savedWorkouts.filter((workout, index) => workout.id !== idToDelete);
      setSavedWorkouts(updatedWorkouts);
      localStorage.setItem("workouts", JSON.stringify(updatedWorkouts));
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
                                    savedWorkouts={savedWorkouts}
                                    deleteWorkout={deleteWorkout} /> 
                                </ProtectedRoute>
                                  } />
          <Route path="/workouts" element={ 
                                <ProtectedRoute>
                                  <WorkoutForm 
                                    savedWorkouts={savedWorkouts} 
                                    setSavedWorkouts={setSavedWorkouts}
                                    deleteWorkout={deleteWorkout}
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
