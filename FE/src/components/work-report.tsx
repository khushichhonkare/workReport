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
import { CalendarIcon, Copy, X, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

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
  )
  return response.data
}

const formatReportData = (data: Record<string, string[]>) => {
  let formattedReport = ''

  for (const [heading, points] of Object.entries(data)) {
    formattedReport += `${heading}:\n`

    if (points.length > 0) {
      points.forEach((point) => {
        formattedReport += `- ${point}\n`
      })
    } else {
      formattedReport += '- No tasks assigned\n'
    }

    formattedReport += '\n'
  }

  return formattedReport.trim()
}

export function WorkReportForm({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { toast } = useToast()

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
    <>
      <Card className={`w-full bg-slate-200 text-slate-700 ${className} mb-4`}>
        <CardHeader className="pb-1">
          <CardTitle className="text-center">Work Report Generator</CardTitle>
          <CardDescription className="text-center">
            Generate reports from your GitHub commits
          </CardDescription>
        </CardHeader>
        <Separator className="my-4 bg-slate-400" />
        <CardContent className="pt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pat">GitHub Personal Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="pat"
                // type="password"
                placeholder="ghp_xxxx..."
                value={pat}
                onChange={(e) => handlePatChange(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleLoadRepos}
                disabled={isLoadingRepos || !pat.trim()}
                className="shrink-0"
              >
                {isLoadingRepos ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Load'
                )}
              </Button>
            </div>
            {isLoadingRepos && (
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading
                repositories...
              </p>
            )}
            {repoError && <p className="text-sm text-red-500">{repoError}</p>}
          </div>

          {repos.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="repo">Select Repository</Label>
              <select
                id="repo"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
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
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full justify-center text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
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
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
        {repos.length > 0 && (
          <CardFooter className="flex justify-between gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setWorkReport('')
              }}
            >
              Clear
            </Button>
            <Button
              className="w-full bg-slate-900"
              onClick={handleGenerateReport}
              disabled={getReport.isPending}
            >
              {getReport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {workReport && (
        <div className="grid w-full gap-1.5 pt-4 text-slate-700">
          <Label htmlFor="report" className="font-semibold text-lg">
            Your Work Report is Ready!
          </Label>

          <div className="relative">
            <Textarea
              id="report"
              value={workReport}
              onChange={(e) => setWorkReport(e.target.value)}
              className="w-full p-2 border rounded"
              rows={8}
            />
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                onClick={handleCopy}
                className="p-1 mt-1 hover:bg-gray-100 rounded"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-1 mt-1 me-2 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Feel free to edit, copy, and paste it into your work report.
          </p>
        </div>
      )}
    </>
  )
}
