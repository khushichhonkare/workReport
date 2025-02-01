import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_URL, FAKE_URL } from './env.js';
import successMessages from '../common/successMessages.js';
import errorMessages from '../common/errorMessages.js';

dotenv.config();
const { NODE_ENV } = process.env;
export function databaseConnection() {
  if (NODE_ENV === 'dev') {
    mongoose
      .connect(DB_URL)
      .then(() => console.log(successMessages.devDbConnectSuccess, DB_URL))
      .catch((error) => console.log(errorMessages.errorInDbConnection));
  }
}
export function fakeDatabaseConnection() {
  if (NODE_ENV === 'testing') {
    mongoose
      .connect(FAKE_URL)
      .then(() => console.log(successMessages.testDbConnectSuccess))
      .catch((error) => console.log(error, errorMessages.errorInDbConnection));
  }
}
