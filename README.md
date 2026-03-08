# Work Report Generator

A modern web application that automatically generates professional work reports from GitHub commit messages and Google Calendar meetings using AI (Google Gemini).

## Overview

Work Report Generator streamlines the process of creating work reports by:
- Fetching commit messages from GitHub repositories
- Integrating Google Calendar meetings
- Using AI to generate structured, professional reports
- Providing a beautiful, modern UI with dark/light theme support

## Tech Stack

### Backend
- **Node.js** with Express.js
- **React 18** with TypeScript
- **MongoDB** with Mongoose

## Features

- **GitHub Integration**
  - Fetch commits from any repository
  - Support for date range filtering
  - Secure PAT storage with encryption

- **Google Calendar Integration**
  - OAuth 2.0 authentication
  - Sync upcoming meetings
  - Include meetings in work reports

- **AI-Powered Reports**
  - Automatic categorization (completed tasks, fixes, pending)
  - Professional language transformation
  - Gemini API integration

- **Modern UI/UX**
  - Dark/Light theme support
  - Glassmorphism design
  - Responsive layout
  - Copy to clipboard functionality
  - Real-time updates

- **Security**
  - Encrypted token storage
  - Secure API key management
  - Session-based authentication



### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Google Cloud Console account
- GitHub account
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd BE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=mongodb://localhost:27017/workreport
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_KEY=your_32_char_encryption_key
   FRONTEND_URL=http://localhost:5173
   PORT=3000
   ```

4. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Calendar API
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
   - Download credentials and save as `credentials.json` in BE folder

5. **Start MongoDB:**
   ```bash
   mongod
   ```

6. **Run the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd FE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_BASE_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:5173`

## Usage

### First Time Setup

1. **Google Authentication:**
   - Click "Connect Google Calendar"
   - Sign in with your Google account
   - Grant calendar permissions

2. **GitHub Token:**
   - Generate a GitHub Personal Access Token (PAT)
   - Required scopes: `repo` (for private repos) or `public_repo`
   - Enter your PAT in the GitHub Token field
   - Click "Load" to fetch your repositories

3. **Gemini API Key:**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Enter it when prompted (modal appears on first login)
   - Key is stored securely in the database

### Generating Reports

1. **Select Repository:**
   - Choose from your GitHub repositories
   - Both public and private repos (with proper PAT)

2. **Choose Date Range:**
   - Select start and end dates
   - Commits within this range will be included

3. **Generate Report:**
   - Click "Generate Report"
   - AI processes commits and meetings
   - Report appears in categorized format

4. **Copy Report:**
   - Click "Copy" to copy to clipboard
   - Paste wherever needed

### Report Format

Reports are structured as:
```
completed:
  • Implemented new feature
  • Attended meeting: Team standup
  • Refactored authentication module

fixes:
  • Fixed login validation bug
  • Resolved API timeout issue

pending:
  • Database optimization
  • Documentation update
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user

### Calendar
- `GET /api/calendar/events` - Fetch calendar events
- `POST /api/calendar/disconnect` - Disconnect calendar

### GitHub
- `POST /api/github/token` - Save GitHub PAT
- `GET /api/github/token` - Get saved PAT
- `DELETE /api/github/token` - Remove PAT
- `POST /get-repos` - Fetch user repositories
- `POST /get-report` - Generate work report

### Gemini
- `POST /api/github/gemini-token` - Save Gemini API key
- `GET /api/github/gemini-token` - Get saved key
- `DELETE /api/github/gemini-token` - Remove key
- `POST /api/github/gemini-token/validate` - Validate key

## Development

### Backend Scripts
```bash
npm run dev      # Start development server with nodemon
npm test         # Run tests
npm run lint     # Run ESLint
```

### Frontend Scripts
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Security Features

- **Token Encryption:** All API tokens are encrypted before storage
- **Secure Sessions:** JWT-based authentication with HTTP-only cookies
- **CORS Protection:** Configured for specific origins
- **Environment Variables:** Sensitive data stored in `.env` files
- **OAuth 2.0:** Secure Google authentication flow

## Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

## Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google API key | Yes |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes |
| `GEMINI_API_KEY` | Gemini API key (fallback) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ENCRYPTION_KEY` | 32-char encryption key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `PORT` | Server port | No (default: 3000) |

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BASE_URL` | Backend API URL | Yes |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env`

2. **Google OAuth Error:**
   - Verify credentials in Google Cloud Console
   - Check redirect URI matches exactly
   - Ensure Calendar API is enabled

3. **GitHub API Rate Limit:**
   - Use authenticated requests with PAT
   - Higher rate limits with PAT

4. **Gemini API Error:**
   - Verify API key is valid
   - Check API quota limits

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for report generation
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React Query](https://tanstack.com/query) for data fetching
