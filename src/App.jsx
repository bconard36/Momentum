import { BrowserRouter, Routes, Route } from 'react-router'
import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Calculator from './components/CalorieTrack/Calculator'
import WorkoutForm from './components/WorkoutForm'
import NotFound from './components/NotFound'
import WorkoutLog from './components/WorkoutLog'

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

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <Dashboard /> } />
          <Route path="/workouts" element={ <WorkoutForm 
                                            savedWorkouts={savedWorkouts} 
                                            setSavedWorkouts={setSavedWorkouts}
                                            />} />
          <Route path="/calculator" element={ <Calculator /> } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
