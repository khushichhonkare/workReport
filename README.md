#Work Report Generator

This project follows a Backend (BE) and Frontend (FE) architecture to manage Google Calendar meetings and generate work reports.

## Project Structure

```
## Project Structure 
├── BE/
│ ├── getGoogleMeetings.js # Google Calendar integration
│ ├── generateWorkReport.js # Work report generation logic
│ ├── credentials.json # Google API credentials
│ └── .env.example # Environment variables template for BE
└── FE/
    ├── src/                 # Source files
    │ ├── components/        # React components
    │ ├── pages/            # Page components
    │ ├── services/         # API services
    │ ├── utils/            # Utility functions
    │ ├── App.js           # Main App component
    │ └── index.js         # Entry point
    ├── public/            # Static files
    ├── package.json       # Dependencies and scripts
    └── .env.example       # Environment variables template for FE
```

## Backend (BE)

The backend handles:
- Fetching meetings from Google Calendar
- Generating work reports
- Managing Google API authentication

### Setup

1. Install dependencies:

   ```bash
   cd BE
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```
   Then, edit the `.env` file with your configuration.

3. Set up Google Calendar API:
   - Place your Google API credentials in `credentials.json`.
   - Enable Google Calendar API in your Google Cloud Console.
   - Configure the necessary OAuth 2.0 scopes.

## Frontend (FE)

The frontend provides a user interface for:
- Viewing calendar meetings
- Managing work reports

### Setup

1. Install dependencies:

   ```bash
   cd FE
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```
   Then, edit the `.env` file with your configuration.

3. Start the development server:

   ```bash
   npm start
   ```

## Contributing

1. Fork the repository.
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
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

