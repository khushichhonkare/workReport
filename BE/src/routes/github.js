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

router.post('/gemini-token', authMiddleware, async (req, res) => {
  try {
    const { apiKey } = req.body

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'Gemini API key is required' })
    }

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.geminiApiKey = apiKey
    await user.save()

    return res.json({ success: true, message: 'Gemini API key saved successfully' })
  } catch (error) {
    console.error('Error saving Gemini API key:', error)
    return res.status(500).json({ error: 'Failed to save Gemini API key' })
  }
})

router.get('/gemini-token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({ 
      hasToken: !!user.geminiApiKey,
      apiKey: user.geminiApiKey || null
    })
  } catch (error) {
    console.error('Error fetching Gemini API key:', error)
    return res.status(500).json({ error: 'Failed to fetch Gemini API key' })
  }
})

router.delete('/gemini-token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.geminiApiKey = null
    await user.save()

    return res.json({ success: true, message: 'Gemini API key removed successfully' })
  } catch (error) {
    console.error('Error removing Gemini API key:', error)
    return res.status(500).json({ error: 'Failed to remove Gemini API key' })
  }
})

export default router
