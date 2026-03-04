import User from '../models/User.js';
import { getUpcomingEvents, revokeGoogleAccess } from '../services/calendarService.js';

export async function getCalendarEvents(req, res) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.hasValidTokens()) {
      return res.status(401).json({ 
        error: 'Google Calendar not connected',
        needsReconnect: true 
      });
    }

    const events = await getUpcomingEvents(user);

    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    
    if (error.message === 'Failed to refresh token') {
      return res.status(401).json({ 
        error: 'Google access expired. Please reconnect.',
        needsReconnect: true 
      });
    }

    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
}

export async function disconnectCalendar(req, res) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await revokeGoogleAccess(user);

    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Disconnect calendar error:', error);
    res.status(500).json({ error: 'Failed to disconnect calendar' });
  }
}
