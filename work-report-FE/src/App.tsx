import { Routes, Route } from "react-router-dom"
import { LoginForm } from "./components/login-form"
import WorkReportPage from "./pages/work-report"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      } />
      <Route path="/work-report" element={<WorkReportPage />} />
    </Routes>
  )
}
