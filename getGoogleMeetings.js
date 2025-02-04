import { google } from "googleapis";
import fs from "fs";
import readline from "readline";

// Load credentials from a JSON file
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const TOKEN_PATH = "token.json"; // Stores OAuth token

// Load credentials
function loadCredentials() {
  return JSON.parse(fs.readFileSync("credentials.json"));
}

// Authenticate using OAuth2
export default async function GoogleAuths() {
  const { client_secret, client_id, redirect_uris } = loadCredentials().web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    return oAuth2Client;
  } else {
    return getNewToken(oAuth2Client);
  }
}

// Get new token
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES });
  console.log("Authorize this app by visiting:", authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        resolve(oAuth2Client);
      });
    });
  });
}

// Fetch calendar events
async function listEvents() {
  const auth = await GoogleAuths();
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = res.data.items;
  if (!events.length) {
    console.log("No upcoming events found.");
  } else {
    console.log("Upcoming Events:");
    events.forEach((event) => {
      console.log(`${event.start.dateTime || event.start.date} - ${event.summary}`);
    });
  }
}

listEvents();
