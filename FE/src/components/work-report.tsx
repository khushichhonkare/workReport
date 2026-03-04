'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Calendar } from '../components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import dayjs from 'dayjs'
import axios, { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Copy, X, Loader2, GitBranch, Sparkles, Check, Github } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

const GITHUB_PAT_KEY = 'github_pat'

interface Repo {
  name: string
  full_name: string
  owner: string
}

const fetchRepos = async (pat: string) => {
  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/get-repos`,
    { pat },
  )
  return response.data
}

const fetchReport = async (params: {
  pat: string
  owner: string
  repo: string
  from: string
  to: string
}) => {
  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/get-report`,
    params,
    { withCredentials: true }
  )
  return response.data
}

const formatReportData = (data: Record<string, string[]>) => {
  let formattedReport = ''

  for (const [heading, points] of Object.entries(data)) {
    formattedReport += `${heading}:\n`

    if (points.length > 0) {
      points.forEach((point) => {
        formattedReport += `  • ${point}\n`
      })
    } else {
      formattedReport += '  • No tasks assigned\n'
    }

    formattedReport += '\n'
  }

  return formattedReport.trim()
}

export function WorkReportForm({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { toast } = useToast()
  const { isConnected } = useAuth()

  const [pat, setPat] = useState(
    () => localStorage.getItem(GITHUB_PAT_KEY) || '',
  )
  const [repos, setRepos] = useState<Repo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
  })
  const [workReport, setWorkReport] = useState('')
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [repoError, setRepoError] = useState('')
  const [copied, setCopied] = useState(false)

  const getRepos = useMutation({
    mutationFn: fetchRepos,
    onSuccess: (data) => {
      setRepos(data.repos)
      setRepoError('')
      if (data.repos.length > 0) {
        setSelectedRepo(data.repos[0].full_name)
      }
    },
    onError: (error: AxiosError<{ error: string }>) => {
      setRepoError(
        error.response?.data?.error || 'Failed to fetch repositories',
      )
      setRepos([])
      setSelectedRepo('')
    },
  })

  const getReport = useMutation({
    mutationFn: fetchReport,
    onSuccess: (data) => {
      const parsedData = JSON.parse(data.data)
      const formattedReport = formatReportData(parsedData)
      setWorkReport(formattedReport)
      if (data.meetingsIncluded && data.rawMessages?.meetings) {
        toast({
          title: 'Success',
          description: `Report generated with ${data.rawMessages.meetings.length} calendar meetings included`,
        })
      }
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to generate report',
        variant: 'destructive',
      })
    },
  })

  const handlePatChange = (value: string) => {
    setPat(value)
    setRepoError('')
    setRepos([])
    setSelectedRepo('')
  }

  const handleLoadRepos = () => {
    if (!pat.trim()) {
      setRepoError('Please enter a Personal Access Token')
      return
    }
    localStorage.setItem(GITHUB_PAT_KEY, pat)
    setIsLoadingRepos(true)
    getRepos.mutate(pat, {
      onSettled: () => setIsLoadingRepos(false),
    })
  }

  const handleGenerateReport = () => {
    if (!pat || !selectedRepo) {
      toast({
        title: 'Error',
        description: 'Please enter PAT and select a repository',
        variant: 'destructive',
      })
      return
    }

    const [owner, repo] = selectedRepo.split('/')
    getReport.mutate({
      pat,
      owner,
      repo,
      from: dayjs(dateRange.from).format('YYYY-MM-DD'),
      to: dayjs(dateRange.to).format('YYYY-MM-DD'),
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(workReport)
    setCopied(true)
    toast({
      title: 'Copied!',
      description: 'Work report copied to clipboard',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setWorkReport('')
  }

  return (
    <div className="space-y-6">
      <Card className={`glass border-border/50 shadow-xl ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Work Report Generator</CardTitle>
              <CardDescription>
                Generate professional reports from your GitHub commits
              </CardDescription>
            </div>
          </div>
          {isConnected && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Calendar connected - meetings will be included
              </span>
            </div>
          )}
        </CardHeader>
        <Separator className="bg-border/50" />
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pat" className="text-sm font-medium">
              GitHub Personal Access Token
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pat"
                  type="password"
                  placeholder="ghp_xxxx..."
                  value={pat}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePatChange(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/25 transition-all"
                />
              </div>
              <Button
                onClick={handleLoadRepos}
                disabled={isLoadingRepos || !pat.trim()}
                className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoadingRepos ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Load'
                )}
              </Button>
            </div>
            {isLoadingRepos && (
              <div className="space-y-2 mt-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-3/4" />
              </div>
            )}
            {repoError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
                {repoError}
              </p>
            )}
          </div>

          {repos.length > 0 && !isLoadingRepos && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Label htmlFor="repo" className="text-sm font-medium">
                Select Repository
              </Label>
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/25">
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                  {repos.map((repo) => (
                    <SelectItem key={repo.full_name} value={repo.full_name}>
                      {repo.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {repos.length > 0 && !isLoadingRepos && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Label className="text-sm font-medium">
                Date Range
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full justify-between bg-background/50 border-border/50 hover:bg-accent/50 font-normal transition-all"
                  >
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
                          </>
                        ) : (
                          format(dateRange.from, 'MMM dd, yyyy')
                        )
                      ) : (
                        <span className="text-muted-foreground">Select date range</span>
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) =>
                      range && setDateRange(range as { from: Date; to: Date })
                    }
                    numberOfMonths={2}
                    className="rounded-lg border-0 shadow-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
        {repos.length > 0 && (
          <CardFooter className="pt-2 pb-6 px-6">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 border-border/50 hover:bg-accent/50 transition-all"
                onClick={() => setWorkReport('')}
              >
                Clear
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleGenerateReport}
                disabled={getReport.isPending}
              >
                {getReport.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Report
                  </span>
                )}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {workReport && (
        <Card className="glass border-border/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Your Work Report</CardTitle>
                <CardDescription>
                  Ready to copy and paste
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className={`text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all ${copied ? 'animate-pulse-success text-green-500' : ''}`}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy to clipboard</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear report</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-border/50" />
          <CardContent className="pt-4">
            <Textarea
              value={workReport}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWorkReport(e.target.value)}
              className="w-full min-h-[200px] bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/25 rounded-lg p-4 text-sm font-mono resize-none transition-all"
              placeholder="Your generated report will appear here..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
