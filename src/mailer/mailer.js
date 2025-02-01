import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import transport from './transporter.js';
import { ADMIN_EMAIL_ID } from '../config/env.js';

// A function that sends an email using Nodemailer
const mailer = async (userDetails, emailContent) => {
  const emailTemplate = fs.readFileSync(emailContent.templatePath, 'utf8');
  const compiledTemplate = handlebars.compile(emailTemplate);
  const mailOptions = {
    from: ADMIN_EMAIL_ID,
    to: userDetails.email,
    subject: emailContent.subject,
    html: compiledTemplate(userDetails),
  };
  try {
    const info = await transport.sendMail(mailOptions);
    console.log('Mail sent', info.response);
  } catch (error) {
    // return error;
    console.log(error);
  }
  // Return a resolved promise to indicate the email sending is complete
  return Promise.resolve();
};

export default mailer;
