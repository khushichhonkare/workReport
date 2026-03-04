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
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="mt-4 text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="w-full max-w-4xl mx-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 rounded-t-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744-.084-.729-.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Work Report</h1>
                <p className="text-sm text-slate-500">Generate reports from your GitHub commits</p>
              </div>
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                {user.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full border-2 border-slate-200"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 hover:text-slate-900">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Connect Google Calendar to include meetings in reports
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">
          <WorkReportForm />
          <div className="mt-6">
            <CalendarEvents />
          </div>
        </main>
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
