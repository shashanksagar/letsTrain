import { Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { MyProgram } from './pages/MyProgram'

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="/program" element={<MyProgram />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  )
}
