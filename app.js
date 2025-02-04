import express from 'express';
import { exec } from 'child_process';
import generateWorkReport from './generateWorkReport.js'; // Updated import
import passport from './src/config/passport.js';
import session from 'express-session';
import GoogleAuths from './getGoogleMeetings.js';

const app = express();
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "abc",
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const getData = async ()=>{
  const data = await GoogleAuths()
  console.log("DATA",data)

}
getData()
// Function to run Git commands
// const runGitCommand = (command) => 
//   new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(new Error(`Error executing command: ${error.message}`));
//         return;
//       }
//       if (stderr) {
//         reject(new Error(`stderr: ${stderr}`));
//         return;
//       }
//       resolve(stdout);
//     });
//   });

// // Main function to process Git logs and generate report
// (async () => {
//   try {
//     const result = await runGitCommand("git --no-pager log");
//     let match;
//     const messages = [];
//     const regex = /(refactor|merge|feat|fix): ([^\n]+)/g;

//     // Extract relevant messages
//     do {
//       match = regex.exec(result);
//       if (match !== null) {
//         messages.push(match[0]);
//       }
//     } while (match !== null);

//     // Generate the report
//     console.log(`------------------------------`);
//     const workReport = await generateWorkReport(messages); // Await the generateWorkReport function
//     console.log(workReport);
//     console.log(`------------------------------`);
//   } catch (err) {
//     console.error(`Error: ${err}`);
//   }
// })();



app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));


app.get('/callback', 
  passport.authenticate('google', { failureRedirect: '/' }), 
  (req, res) => {
    console.log("req.user", req.user); // req.user will contain the authenticated user's profile
    res.send(req.user); // or any other success route
  }
);

// Start the Express server
app.listen(3000, () => {
  console.log("Server activated at 3000");
});

export default app;
