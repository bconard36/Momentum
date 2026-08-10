import { BrowserRouter, Routes, Route } from 'react-router'
import Dashboard from './components/Dashboard'
import Calculator from './components/CalorieTrack/Calculator'
import WorkoutForm from './components/WorkoutForm'
import NotFound from './components/NotFound'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <Dashboard /> } />
          <Route path="/workouts" element={ <WorkoutForm />} />
          <Route path="/calculator" element={ <Calculator /> } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
