import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface User {
  id: string
  email: string
  name: string
  picture: string
  isConnected: boolean
}

export interface Attendee {
  email: string
  displayName?: string
  responseStatus?: string
}

export interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  attendees: Attendee[]
  meetLink: string | null
}

export interface CalendarEventsResponse {
  events: CalendarEvent[]
}

export interface UserResponse {
  user: User
}

export interface GitHubTokenResponse {
  hasToken: boolean
  pat: string | null
}

export interface SaveTokenResponse {
  success: boolean
  message: string
}

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>('/auth/me')
  return response.data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const getCalendarEvents = async (): Promise<CalendarEventsResponse> => {
  const response = await api.get<CalendarEventsResponse>('/api/calendar/events')
  return response.data
}

export const disconnectCalendar = async (): Promise<void> => {
  await api.post('/api/calendar/disconnect')
}

export const getGoogleAuthUrl = (): string => {
  return `${import.meta.env.VITE_BASE_URL}/auth/google`
}

export const getGitHubToken = async (): Promise<GitHubTokenResponse> => {
  const response = await api.get<GitHubTokenResponse>('/api/github/token')
  return response.data
}

export const saveGitHubToken = async (pat: string): Promise<SaveTokenResponse> => {
  const response = await api.post<SaveTokenResponse>('/api/github/token', { pat })
  return response.data
}

export const deleteGitHubToken = async (): Promise<SaveTokenResponse> => {
  const response = await api.delete<SaveTokenResponse>('/api/github/token')
  return response.data
}

export const getGeminiToken = async (): Promise<GitHubTokenResponse> => {
  const response = await api.get<GitHubTokenResponse>('/api/github/gemini-token')
  return response.data
}

export const validateGeminiToken = async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  const response = await api.post<{ valid: boolean; error?: string }>('/api/github/gemini-token/validate', { apiKey })
  return response.data
}

export const saveGeminiToken = async (apiKey: string): Promise<SaveTokenResponse> => {
  const response = await api.post<SaveTokenResponse>('/api/github/gemini-token', { apiKey })
  return response.data
}

export const deleteGeminiToken = async (): Promise<SaveTokenResponse> => {
  const response = await api.delete<SaveTokenResponse>('/api/github/gemini-token')
  return response.data
}

export default api
