'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { CalendarIcon, ExternalLink, Loader2, Unlink, RefreshCw, Video } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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

function EventSkeleton() {
  return (
    <div className="p-4 bg-background/50 rounded-lg border border-border/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-1 mt-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
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
  }, [isConnected])

  if (!isConnected) {
    return (
      <Card className="glass border-border/50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/25">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Google Calendar</CardTitle>
              <CardDescription>
                Connect to include meetings in reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-border/50" />
        <CardContent className="pt-6">
          <Button 
            onClick={login} 
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Connect Google Calendar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass border-border/50 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/25">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Upcoming Meetings</CardTitle>
              <CardDescription>
                {events.length > 0
                  ? `${events.length} meeting${events.length > 1 ? 's' : ''} synced`
                  : 'No meetings found'}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchEvents.mutate()}
                  disabled={fetchEvents.isPending}
                  className="hover:bg-accent/50 transition-all"
                >
                  {fetchEvents.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh meetings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => disconnect.mutate()}
                  disabled={disconnect.isPending}
                  className="hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  {disconnect.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Disconnect Calendar</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-border/50" />
      <CardContent className="pt-6">
        {fetchEvents.isPending ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`animate-in fade-in slide-in-from-left-2 duration-300`} style={{ animationDelay: `${i * 100}ms` }}>
                <EventSkeleton />
              </div>
            ))}
          </div>
        ) : needsReconnect ? (
          <div className="text-center py-8 bg-destructive/5 rounded-xl border border-destructive/20">
            <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto mb-3">
              <Unlink className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button onClick={login} variant="outline" size="sm" className="border-destructive/30 hover:bg-destructive/10">
              Reconnect
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-8 bg-muted/30 rounded-xl">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-xl">
            <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-3">
              <Video className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No meetings with attendees or Google Meet
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="group p-4 bg-gradient-to-r from-background/80 to-background/50 rounded-xl border border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{event.summary}</h4>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatEventTime(event.start)}
                    </p>
                    {event.attendees.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <div className="flex -space-x-2">
                          {event.attendees.slice(0, 3).map((a, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-background flex items-center justify-center shadow-sm"
                            >
                              <span className="text-[9px] text-white font-semibold">
                                {(a.displayName || a.email || '?')[0].toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                        {event.attendees.length > 3 && (
                          <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                            +{event.attendees.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {event.meetLink && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={event.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Join meeting</TooltipContent>
                    </Tooltip>
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
