import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

router.post('/token', authMiddleware, async (req, res) => {
  try {
    const { pat } = req.body

    if (!pat || typeof pat !== 'string') {
      return res.status(400).json({ error: 'GitHub PAT is required' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.githubPat = pat
    await user.save()

    return res.json({ success: true, message: 'GitHub PAT saved successfully' })
  } catch (error) {
    console.error('Error saving GitHub PAT:', error)
    return res.status(500).json({ error: 'Failed to save GitHub PAT' })
  }
})

router.get('/token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({ 
      hasToken: !!user.githubPat,
      pat: user.githubPat || null
    })
  } catch (error) {
    console.error('Error fetching GitHub PAT:', error)
    return res.status(500).json({ error: 'Failed to fetch GitHub PAT' })
  }
})

router.delete('/token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.githubPat = null
    await user.save()

    return res.json({ success: true, message: 'GitHub PAT removed successfully' })
  } catch (error) {
    console.error('Error removing GitHub PAT:', error)
    return res.status(500).json({ error: 'Failed to remove GitHub PAT' })
  }
})

export default router
