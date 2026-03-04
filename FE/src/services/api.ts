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

export default api
