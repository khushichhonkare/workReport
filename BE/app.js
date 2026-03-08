import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import axios from 'axios'

import connectDB from './src/config/database.js'
import configurePassport from './src/config/passport.js'
import generateWorkReport from './generateWorkReport.js'

import authRoutes from './src/routes/auth.js'
import calendarRoutes from './src/routes/calendar.js'
import githubRoutes from './src/routes/github.js'
import { optionalAuth } from './src/middleware/auth.js'
import User from './src/models/User.js'
import { getEventsForDateRange } from './src/services/calendarService.js'

const app = express()

connectDB()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)

app.use(cookieParser())

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.JWT_SECRET || 'abc',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())

configurePassport(passport)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/github', githubRoutes)

app.post('/get-repos', optionalAuth, async (req, res) => {
  try {
    let { pat } = req.body

    if (!pat && req.userId) {
      const user = await User.findById(req.userId)
      if (user && user.githubPat) {
        pat = user.githubPat
      }
    }

    if (!pat) {
      return res
        .status(400)
        .json({ error: 'Personal Access Token is required' })
    }
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${pat}`,
      },
      params: {
        sort: 'updated',
        per_page: 100,
      },
    })

    const repos = response.data.map((repo) => ({
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
    }))

    return res.json({ repos })
  } catch (err) {
    console.error('Error fetching repos:', err.response?.data || err.message)
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid Personal Access Token' })
    }
    return res.status(500).json({ error: 'Failed to fetch repositories' })
  }
})

app.post('/get-report', optionalAuth, async (req, res) => {
  try {
    let { pat, owner, repo, from, to } = req.body

    if (!pat && req.userId) {
      const user = await User.findById(req.userId)
      if (user && user.githubPat) {
        pat = user.githubPat
      }
    }

    if (!pat || !owner || !repo) {
      return res
        .status(400)
        .json({ error: 'PAT, owner, and repo are required' })
    }

    const params = new URLSearchParams()
    if (from) params.append('since', new Date(from).toISOString())
    if (to) params.append('until', new Date(to).toISOString())
    params.append('per_page', 100)

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    )

    const commits = response.data
    const messages = []
    const regex = /^(refactor|merge|feat|fix):\s*(.+)$/i

    commits.forEach((commit) => {
      const message = commit.commit.message.split('\n')[0]
      const match = message.match(regex)
      if (match) {
        messages.push(`${match[1].toLowerCase()}: ${match[2]}`)
      }
    })

    let meetingsSummaries = []
    if (req.userId) {
      try {
        const user = await User.findById(req.userId)
        if (user && user.hasValidTokens()) {
          const events = await getEventsForDateRange(user, from, to)
          meetingsSummaries = events.map((e) => e.summary)
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err.message)
      }
    }

    const workReport = await generateWorkReport(messages, meetingsSummaries)
    return res.json({
      data: workReport,
      rawMessages: messages,
      meetings: meetingsSummaries,
    })
  } catch (err) {
    console.error('Error fetching commits:', err.response?.data || err.message)
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid Personal Access Token' })
    }
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Repository not found' })
    }
    return res.status(500).json({ error: 'Failed to fetch commits' })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server activated at ${PORT}`)
})

export default app
