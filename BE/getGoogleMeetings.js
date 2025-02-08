import { google } from "googleapis";


/**
 * Fetches events from Google Calendar using a user's access token.
 * @param {string} accessToken - User's Google OAuth access token.
 * @returns {Promise<Object[]>} - List of calendar events.
 */
export default async function getGoogleMeetings(accessToken) {
    try {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: "v3", auth });

        const response = await calendar.events.list({
            calendarId: "primary", // Fetch from the user's primary calendar
            timeMin: new Date().toISOString(), // Get upcoming events from now
            maxResults: 10, // Fetch latest 10 events (adjust if needed)
            singleEvents: true,
            orderBy: "startTime",
        });

        return response.data.items || "No meetings found";
    } catch (error) {
        console.error("Error fetching Google Calendar events:", error);
        throw new Error("Failed to fetch meetings from Google Calendar");
    }
}

