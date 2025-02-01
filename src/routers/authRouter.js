import express from 'express';
import { checkExact } from 'express-validator';
import { fieldMessage } from '../common/constant.js';
import * as controller from '../controllers/index.js';
import {
  validateSignUpFields,
  logInValidation,
  isDuplicateEmail,
  ErrorValidatorFunction,
} from '../middlewares/authValidator.js';

const adminRouter = express.Router();
adminRouter.post(
  '/signup',
  checkExact(validateSignUpFields, { fieldMessage }),
  ErrorValidatorFunction,
  isDuplicateEmail,
  controller.signup,
);

adminRouter.get('/verify', controller.signUpVerification);

adminRouter.post(
  '/login',
  checkExact(logInValidation, { fieldMessage }),
  ErrorValidatorFunction,
  controller.login,
);

export default adminRouter;
