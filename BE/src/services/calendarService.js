import { google } from 'googleapis';
import User from '../models/User.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

export async function refreshAccessToken(user) {
  try {
    const decryptedRefreshToken = decrypt(user.refreshToken);
    
    if (!decryptedRefreshToken) {
      throw new Error('No refresh token available');
    }

    oauth2Client.setCredentials({
      refresh_token: decryptedRefreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    user.accessToken = credentials.access_token;
    if (credentials.refresh_token) {
      user.refreshToken = encrypt(credentials.refresh_token);
    }
    user.tokenExpiry = new Date(Date.now() + (credentials.expiry_date || 3600 * 1000));
    await user.save();

    return credentials.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw new Error('Failed to refresh token');
  }
}

export async function getCalendarClient(user) {
  let accessToken = user.accessToken;

  if (user.isTokenExpired()) {
    accessToken = await refreshAccessToken(user);
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function getUpcomingEvents(user) {
  const calendar = await getCalendarClient(user);

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];

  const filteredEvents = events.filter((event) => {
    const hasAttendees = event.attendees && event.attendees.length > 0;
    const hasConferenceData = event.conferenceData;
    return hasAttendees || hasConferenceData;
  });

  const formattedEvents = filteredEvents.slice(0, 20).map((event) => {
    let meetLink = null;
    if (event.conferenceData?.entryPoints) {
      const meetEntry = event.conferenceData.entryPoints.find(
        (entry) => entry.entryPointType === 'video'
      );
      meetLink = meetEntry?.uri || null;
    }

    return {
      id: event.id,
      summary: event.summary || 'No title',
      start: event.start,
      end: event.end,
      attendees: event.attendees
        ? event.attendees.map((a) => ({
            email: a.email,
            displayName: a.displayName,
            responseStatus: a.responseStatus,
          }))
        : [],
      meetLink,
    };
  });

  return formattedEvents;
}

export async function revokeGoogleAccess(user) {
  try {
    oauth2Client.setCredentials({
      access_token: user.accessToken,
    });
    
    await oauth2Client.revokeCredentials();
    
    user.accessToken = null;
    user.refreshToken = null;
    user.tokenExpiry = null;
    await user.save();
    
    return true;
  } catch (error) {
    console.error('Error revoking Google access:', error);
    user.accessToken = null;
    user.refreshToken = null;
    user.tokenExpiry = null;
    await user.save();
    return false;
  }
}
