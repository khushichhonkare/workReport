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
import dayjs from 'dayjs'
import axios, { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Copy, X, Loader2, GitBranch, Sparkles } from 'lucide-react'
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
    toast({
      title: 'Copied!',
      description: 'Work report copied to clipboard',
    })
  }

  const handleClear = () => {
    setWorkReport('')
  }

  return (
    <div className="space-y-6">
      <Card className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Work Report Generator</CardTitle>
              <CardDescription className="text-slate-500">
                Generate professional reports from your GitHub commits
              </CardDescription>
            </div>
          </div>
          {isConnected && (
            <div className="mt-4 flex items-center gap-2 px-1">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                Calendar connected - meetings will be included
              </span>
            </div>
          )}
        </CardHeader>
        <Separator className="bg-slate-100" />
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pat" className="text-sm font-medium text-slate-700">
              GitHub Personal Access Token
            </Label>
            <div className="flex gap-2">
              <Input
                id="pat"
                type="password"
                placeholder="ghp_xxxx..."
                value={pat}
                onChange={(e) => handlePatChange(e.target.value)}
                className="flex-1 bg-slate-50/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
              <Button
                onClick={handleLoadRepos}
                disabled={isLoadingRepos || !pat.trim()}
                className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md"
              >
                {isLoadingRepos ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Load'
                )}
              </Button>
            </div>
            {isLoadingRepos && (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading repositories...
              </p>
            )}
            {repoError && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                {repoError}
              </p>
            )}
          </div>

          {repos.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <Label htmlFor="repo" className="text-sm font-medium text-slate-700">
                Select Repository
              </Label>
              <select
                id="repo"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full h-11 rounded-lg border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              >
                {repos.map((repo) => (
                  <option key={repo.full_name} value={repo.full_name}>
                    {repo.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {repos.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <Label className="text-sm font-medium text-slate-700">
                Date Range
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full justify-between bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700 font-normal"
                  >
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                    <span>
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
                          </>
                        ) : (
                          format(dateRange.from, 'MMM dd, yyyy')
                        )
                      ) : (
                        'Select date range'
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
                className="flex-1 border-slate-200 hover:bg-slate-100"
                onClick={() => setWorkReport('')}
              >
                Clear
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
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
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-800">Your Work Report</CardTitle>
                <CardDescription className="text-slate-500">
                  Ready to copy and paste
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-slate-100" />
          <CardContent className="pt-4">
            <Textarea
              value={workReport}
              onChange={(e) => setWorkReport(e.target.value)}
              className="w-full min-h-[200px] bg-slate-50/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg p-4 text-sm font-mono"
              placeholder="Your generated report will appear here..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
