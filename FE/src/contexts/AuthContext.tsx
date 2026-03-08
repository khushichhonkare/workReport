import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, getCurrentUser, logout as apiLogout } from '../services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isConnected: boolean
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await getCurrentUser()
      setUser(response.user)
    } catch {
      setUser(null)
      localStorage.removeItem('auth_token')
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      
      // Check for token in URL (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search)
      const tokenFromUrl = urlParams.get('token')
      
      if (tokenFromUrl) {
        // Store token and clean URL
        localStorage.setItem('auth_token', tokenFromUrl)
        window.history.replaceState({}, '', window.location.pathname)
      }
      
      await refreshUser()
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = () => {
    const authUrl = `${import.meta.env.VITE_BASE_URL}/auth/google`
    window.location.href = authUrl
  }

  const logout = async () => {
    try {
      await apiLogout()
      setUser(null)
      localStorage.removeItem('auth_token')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isConnected = user?.isConnected ?? false

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConnected,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
