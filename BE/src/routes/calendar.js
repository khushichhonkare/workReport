import express from 'express';
import { 
  getCalendarEvents, 
  disconnectCalendar 
} from '../controllers/calendarController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/events', authMiddleware, getCalendarEvents);

router.post('/disconnect', authMiddleware, disconnectCalendar);

export default router;
