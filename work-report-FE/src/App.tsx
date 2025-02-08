import { Routes, Route } from "react-router-dom"
import { LoginForm } from "./components/login-form"
import { WorkReportForm } from "./components/work-report"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
    <Routes>
      <Route path="/login" element={
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md flex  items-center justify-center">
            <LoginForm />
          </div>
        </div>
      } />
       <Route path="/work-report" element={
         <div className="flex min-h-svh w-full items-top justify-center p-6 md:p-10 bg-slate-100">
         <div className="w-full max-w-md">
         <WorkReportForm />
         </div>
       </div>
       } />
       
    </Routes>
    </QueryClientProvider>
  )
}
