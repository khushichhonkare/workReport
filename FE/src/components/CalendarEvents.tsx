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
    return format(new Date(start.dateTime), 'MMM dd, h:mm a')
  }
  if (start.date) {
    return format(new Date(start.date), 'MMM dd')
  }
  return 'TBD'
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
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Google Calendar</CardTitle>
              <CardDescription className="text-slate-500">
                Connect to include meetings in reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-slate-100" />
        <CardContent className="pt-6">
          <Button 
            onClick={login} 
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 shadow-lg"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Upcoming Meetings</CardTitle>
              <CardDescription className="text-slate-500">
                {events.length > 0
                  ? `${events.length} meeting${events.length > 1 ? 's' : ''} synced`
                  : 'No meetings found'}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchEvents.mutate()}
              disabled={fetchEvents.isPending}
              className="hover:bg-slate-100"
            >
              {fetchEvents.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
              title="Disconnect Calendar"
              className="hover:bg-red-50 hover:text-red-600"
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
      <Separator className="bg-slate-100" />
      <CardContent className="pt-6">
        {fetchEvents.isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : needsReconnect ? (
          <div className="text-center py-6 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={login} variant="outline" size="sm" className="border-red-200 hover:bg-red-100">
              Reconnect
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-6 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-400">
              No meetings with attendees or Google Meet
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="group p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-700 truncate">{event.summary}</h4>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {formatEventTime(event.start)}
                    </p>
                    {event.attendees.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex -space-x-2">
                          {event.attendees.slice(0, 3).map((a, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center"
                            >
                              <span className="text-[8px] text-white font-medium">
                                {(a.displayName || a.email || '?')[0].toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                        {event.attendees.length > 3 && (
                          <span className="text-xs text-slate-400">
                            +{event.attendees.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {event.meetLink && (
                    <a
                      href={event.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
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
