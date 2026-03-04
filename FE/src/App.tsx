import { WorkReportForm } from "./components/work-report"
import { CalendarEvents } from "./components/CalendarEvents"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const queryClient = new QueryClient()

function AppContent() {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-top justify-center p-6 md:p-10 bg-slate-100">
      <div className="w-full max-w-md space-y-4">
        {user && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
        <WorkReportForm />
        <CalendarEvents />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}
