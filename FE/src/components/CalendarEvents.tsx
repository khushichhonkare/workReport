'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, ExternalLink, Loader2, Unlink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getCalendarEvents, disconnectCalendar, CalendarEvent } from '../services/api'
import { AxiosError } from 'axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface CalendarError {
  error: string
  needsReconnect?: boolean
}

const formatEventTime = (start: { dateTime?: string; date?: string }) => {
  if (start.dateTime) {
    return format(new Date(start.dateTime), 'MMM dd, yyyy h:mm a')
  }
  if (start.date) {
    return format(new Date(start.date), 'MMM dd, yyyy')
  }
  return 'Time not specified'
}

export function CalendarEvents() {
  const { isConnected, login, refreshUser } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [needsReconnect, setNeedsReconnect] = useState(false)

  const fetchEvents = useMutation({
    mutationFn: getCalendarEvents,
    onSuccess: (data) => {
      setEvents(data.events)
      setError(null)
      setNeedsReconnect(false)
    },
    onError: (err: AxiosError<CalendarError>) => {
      setError(err.response?.data?.error || 'Failed to fetch events')
      setNeedsReconnect(err.response?.data?.needsReconnect || false)
    },
  })

  const disconnect = useMutation({
    mutationFn: disconnectCalendar,
    onSuccess: () => {
      setEvents([])
      refreshUser()
    },
  })

  useEffect(() => {
    if (isConnected) {
      fetchEvents.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  if (!isConnected) {
    return (
      <Card className="w-full bg-slate-200 text-slate-700">
        <CardHeader className="pb-1">
          <CardTitle className="text-center text-lg">Google Calendar</CardTitle>
          <CardDescription className="text-center">
            Connect to view your upcoming meetings
          </CardDescription>
        </CardHeader>
        <Separator className="bg-slate-400" />
        <CardContent className="pt-4">
          <Button onClick={login} className="w-full bg-slate-900">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-slate-200 text-slate-700">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
            <CardDescription>
              {events.length > 0
                ? `${events.length} upcoming meeting${events.length > 1 ? 's' : ''}`
                : 'No upcoming meetings'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEvents.mutate()}
              disabled={fetchEvents.isPending}
            >
              {fetchEvents.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
              title="Disconnect Calendar"
            >
              {disconnect.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-slate-400" />
      <CardContent className="pt-4">
        {fetchEvents.isPending ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : needsReconnect ? (
          <div className="text-center py-4">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <Button onClick={login} variant="outline" size="sm">
              Reconnect Google Calendar
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-slate-500 py-4">
            No upcoming meetings with attendees or Google Meet
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-white rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{event.summary}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatEventTime(event.start)}
                    </p>
                    {event.attendees.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        {event.attendees.length} attendee
                        {event.attendees.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {event.meetLink && (
                    <a
                      href={event.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
