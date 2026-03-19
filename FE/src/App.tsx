import { WorkReportForm } from './components/work-report'
import { CalendarEvents } from './components/CalendarEvents'
import { useState, useEffect } from 'react'
import { SettingsModal } from './components/SettingsModal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getGeminiToken, getGitHubToken } from '@/services/api'
import {
  Loader2,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User as UserIcon,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoginScreen } from '@/components/LoginScreen'
import { SetupScreen } from '@/components/SetupScreen'

const queryClient = new QueryClient()

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={theme === 'system' ? 'bg-accent' : ''}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface TokenStatus {
  hasGeminiKey: boolean | null
  hasGithubPat: boolean | null
  isChecking: boolean
}

function AppContent() {
  const { user, isLoading, logout } = useAuth()
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    hasGeminiKey: null,
    hasGithubPat: null,
    isChecking: true,
  })

  useEffect(() => {
    if (user) {
      setTokenStatus((prev) => ({ ...prev, isChecking: true }))
      Promise.all([getGeminiToken(), getGitHubToken()])
        .then(([geminiData, githubData]) => {
          setTokenStatus({
            hasGeminiKey: geminiData.hasToken && !!geminiData.apiKey,
            hasGithubPat: githubData.hasToken && !!githubData.pat,
            isChecking: false,
          })
        })
        .catch((err) => {
          console.error('Failed to check tokens:', err)
          setTokenStatus({
            hasGeminiKey: false,
            hasGithubPat: false,
            isChecking: false,
          })
        })
    } else {
      setTokenStatus({
        hasGeminiKey: null,
        hasGithubPat: null,
        isChecking: false,
      })
    }
  }, [user])

  const handleSetupComplete = () => {
    setTokenStatus({
      hasGeminiKey: true,
      hasGithubPat: true,
      isChecking: false,
    })
  }

  const handleSettingsSaved = () => {
    window.location.reload()
  }

  if (isLoading || tokenStatus.isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background bg-mesh-gradient">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!tokenStatus.hasGeminiKey || !tokenStatus.hasGithubPat) {
    return <SetupScreen onComplete={handleSetupComplete} />
  }

  return (
    <div className="min-h-screen w-full bg-background bg-mesh-gradient transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <header className="glass border border-border/50 rounded-xl shadow-lg mb-6 animate-slide-down">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-sm">WR</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    Work Report
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    GitHub commits & Google Meetings
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSettingsModalOpen(true)}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-auto p-1 sm:p-2 hover:bg-accent/50"
                    >
                      <div className="hidden sm:block text-right mr-1">
                        <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {user.email}
                        </p>
                      </div>
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-border shadow-sm bg-muted flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="sm:hidden px-2 py-1.5 border-b border-border mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <div className="animate-slide-up">
            <WorkReportForm onOpenSettings={() => setSettingsModalOpen(true)} />
          </div>
          <div className="animate-slide-up stagger-2">
            <CalendarEvents />
          </div>
        </main>

        <footer className="mt-8 text-center text-xs text-muted-foreground/60">
          Built with React, Tailwind CSS & shadcn/ui
        </footer>
      </div>

      <SettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        onSaved={handleSettingsSaved}
      />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
