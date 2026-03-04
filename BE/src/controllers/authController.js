import User from '../models/User.js'
import { generateToken } from '../config/jwt.js'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export function googleAuthCallback(req, res) {
  try {
    const user = req.user

    if (!user) {
      return res.redirect(`${FRONTEND_URL}?error=auth_failed`)
    }

    const token = generateToken({ userId: user._id })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.redirect(`${FRONTEND_URL}`)
  } catch (error) {
    console.error('Google auth callback error:', error)
    res.redirect(`${FRONTEND_URL}?error=auth_failed`)
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    console.log('User tokens debug:', {
      hasAccessToken: !!user.accessToken,
      hasRefreshToken: !!user.refreshToken,
      accessTokenLength: user.accessToken?.length,
      refreshTokenLength: user.refreshToken?.length,
    })

    const isConnected = user.hasValidTokens()

    console.log('isConnected result:', isConnected)

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isConnected,
      },
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Failed to logout' })
  }
}
