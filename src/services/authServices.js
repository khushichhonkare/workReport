/* eslint-disable new-cap */
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import userSchema from '../models/authModel.js';
import {
  JWT_SECRET_KEY,
  BACKEND_BASE_URL,
  JWT_EXPIRATION_TIMEOUT,
} from '../config/env.js';
import customError from '../helper/customError.js';
import mailer from '../mailer/mailer.js';
import errorMessages from '../common/errorMessages.js';
import {
  emailSubjects,
  signupTemplateContent,
} from '../common/emailContent.js';
import successMessages from '../common/successMessages.js';
import asyncFunctionHandler from '../helper/helperFunctions.js';

/**
 * Sign up a new user with the provided details.
 *
 * @param {Object} details - An object containing user details like firstName, lastName, gender, email, contactNumber, password, and role.
 * @returns {Promise<Object | null>} A Promise that resolves to the created user object or null if an error occurs.
 */
const signUp = async (details) => {
  const { firstName, lastName, gender, email, contactNumber, password, role } =
    details;
  const token = crypto.randomBytes(32).toString('hex');
  const userDetails = await userSchema.create({
    firstName,
    lastName,
    gender,
    email,
    contactNumber,
    password,
    role,
    verificationToken: token,
  });
  const emailContent = {
    templatePath: `./src/emailTemplates/signupVerification`,
    subject: emailSubjects.verificationSubject,
  };
  userDetails.verificationLink = `${BACKEND_BASE_URL}/verify?token=${token}`;
  userDetails.templateContent = signupTemplateContent;
  await mailer(userDetails, emailContent);
  return userDetails;
};

/**
 * Verify a user's email by handling the verification token sent via email.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {Object} A JSON response indicating the result of email verification.
 */
const signUpVerification = asyncFunctionHandler(async (req, res, next) => {
  const { token } = req.query;
  const Details = await userSchema.findOne({ verificationToken: token });
  if (!Details) {
    throw new customError(401, errorMessages.invalidToken);
  }
  await userSchema.findByIdAndUpdate(
    Details._id,
    {
      verificationToken: null,
      verificationStatus: true,
    },
    { new: true },
  );
  return res
    .status(200)
    .json({ statusCode: 200, message: successMessages.verified });
});

/**
 * Log in a user by validating their email and password, and return a JWT token upon successful login.
 *
 * @param {Object} req - The HTTP request object containing user credentials (email and password).
 * @param {Object} res - The HTTP response object to send login responses.
 */
const login = asyncFunctionHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await userSchema.findOne({
    email,
  });
  if (!data) {
    return res
      .status(400)
      .json({ statusCode: 400, message: errorMessages.loginDataNotMatched });
  }
  const passwordMatch = await data.validatePassword(password);
  if (!passwordMatch) {
    return res
      .status(400)
      .json({ statusCode: 400, message: errorMessages.loginDataNotMatched });
  }
  const { role } = data;
  const { _id } = data;
  const token = jwt.sign(
    { email: data.email, name: data.name },
    JWT_SECRET_KEY,
    {
      expiresIn: JWT_EXPIRATION_TIMEOUT,
    },
  );
  return res.status(200).json({
    statusCode: 200,
    message: successMessages.loginSuccess,
    role,
    _id,
    token,
  });
});
export { signUp, signUpVerification, login };
