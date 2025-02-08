import express from 'express';
import { exec } from 'child_process';
import generateWorkReport from './generateWorkReport.js'; // Updated import
// import passport from './src/config/passport.js';
import session from 'express-session';


const app = express();
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "abc",
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const runGitCommand = (command) => 
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error executing command: ${error.message}`));
        return;
      }
      if (stderr) {
        reject(new Error(`stderr: ${stderr}`));
        return;
      }
      resolve(stdout);
    });
  });


app.get('/get-report', async (req, res) => {
  try {
    const startDate = req.query.from || ""
    const endDate = req.query.to || ""
    const result = await runGitCommand(`git --no-pager log --since="${startDate}" --until="${endDate}"`);
    let match;
    const messages = [];
    const regex = /(refactor|merge|feat|fix): ([^\n]+)/g;
    do {
      match = regex.exec(result);
      if (match !== null) {
        messages.push(match[0]);
      }
    } while (match !== null);
    const workReport = await generateWorkReport(messages);
    return res.json({
      data: workReport
    })
  } catch (err) {
    console.error(`Error: ${err}`);
  }
});

app.listen(3000, () => {
  console.log("Server activated at 3000");
});



export default app;
