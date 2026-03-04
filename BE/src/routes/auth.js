import express from 'express';
import passport from 'passport';
import { 
  googleAuthCallback, 
  getCurrentUser, 
  logout 
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleAuthCallback
);

router.get('/me', authMiddleware, getCurrentUser);

router.post('/logout', logout);

export default router;
