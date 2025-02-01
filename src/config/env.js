import dotenv from 'dotenv';

dotenv.config();

const envError = (envVariable) => {
  throw new Error(`Environment variable ${envVariable} is missing`);
};

const FAKE_URL = process.env.FAKE_URL || envError('FAKE_URL');
const TRANSPORT_SERVICE =
  process.env.TRANSPORT_SERVICE || envError('TRANSPORT_SERVICE');
const DB_URL = process.env.DB_URL || envError('DB_URL');
const PORT = process.env.PORT || envError('PORT');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || envError('JWT_SECRET_KEY');
const ADMIN_EMAIL_PASSWORD =
  process.env.ADMIN_EMAIL_PASSWORD || envError('ADMIN_EMAIL_PASSWORD');
const ADMIN_EMAIL_ID = process.env.ADMIN_EMAIL_ID || envError('ADMIN_EMAIL_ID');
const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL || envError('BACKEND_BASE_URL');
const TRANSPORT_HOST = process.env.TRANSPORT_HOST || envError('TRANSPORT_HOST');
const JWT_EXPIRATION_TIMEOUT =
  process.env.JWT_EXPIRATION_TIMEOUT || envError('JWT_EXPIRATION_TIMEOUT');
const SESSION_SECRET_KEY =
  process.env.SESSION_SECRET_KEY || envError('SESSION_SECRET_KEY');
const TRANSPORT_PORT = process.env.TRANSPORT_PORT || envError('TRANSPORT_PORT');
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || envError('GOOGLE_CALLBACK_URL');
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || envError('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || envError('GOOGLE_CLIENT_SECRET');
export {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  FAKE_URL,
  TRANSPORT_PORT,
  DB_URL,
  PORT,
  SESSION_SECRET_KEY,
  JWT_SECRET_KEY,
  ADMIN_EMAIL_PASSWORD,
  ADMIN_EMAIL_ID,
  BACKEND_BASE_URL,
  TRANSPORT_HOST,
  TRANSPORT_SERVICE,
  JWT_EXPIRATION_TIMEOUT,
};
