import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import generateWorkReport from './generateWorkReport.js'
import session from 'express-session'
import axios from 'axios'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'abc',
  }),
)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post('/get-repos', async (req, res) => {
  try {
    const { pat } = req.body

    if (!pat) {
      return res
        .status(400)
        .json({ error: 'Personal Access Token is required' })
    }
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${pat}`,
        // Accept: 'application/vnd.github.v3+json',
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

app.post('/get-report', async (req, res) => {
  try {
    const { pat, owner, repo, from, to } = req.body
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
    const workReport = await generateWorkReport(messages)
    return res.json({ data: workReport, rawMessages: messages })
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

app.listen(3000, () => {
  console.log('Server activated at 3000')
})

export default app
