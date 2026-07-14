import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'
import { WorkoutLogger } from './pages/WorkoutLogger'
import { Progress } from './pages/Progress'
import { LogBody } from './pages/LogBody'
import { LogFood } from './pages/LogFood'
import { BottomNav } from './components/ui/BottomNav'
import { Settings } from './pages/Settings'
import { Library } from './pages/Library'

export default function App() {
  return (
    <>
      <div className="pb-16">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/program" element={<MyProgram />} />
          <Route path="/workout/:programId/:dayIndex" element={<WorkoutLogger />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/log-body" element={<LogBody />} />
          <Route path="/log-food" element={<LogFood />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/library" element={<Library />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}
