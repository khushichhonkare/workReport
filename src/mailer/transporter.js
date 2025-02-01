import nodemailer from 'nodemailer';
import {
  ADMIN_EMAIL_ID,
  ADMIN_EMAIL_PASSWORD,
  TRANSPORT_PORT,
  TRANSPORT_HOST,
  TRANSPORT_SERVICE,
} from '../config/env.js';

const transport = nodemailer.createTransport({
  service: TRANSPORT_SERVICE,
  host: TRANSPORT_HOST,
  port: TRANSPORT_PORT,
  secure: true,
  auth: {
    user: ADMIN_EMAIL_ID,
    pass: ADMIN_EMAIL_PASSWORD,
  },
});
export default transport;
