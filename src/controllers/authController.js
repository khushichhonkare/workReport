import successMessages from '../common/successMessages.js';
import * as services from '../services/index.js';
import asyncFunctionHandler from '../helper/helperFunctions.js';

/**
 * Handles user sign-up. It utilizes the asyncFunctionHandler middleware
 * to manage asynchronous operations. If the sign-up is successful, it responds
 * with a 200 status code and a success message.
 *
 * @param req - Express Request object containing user sign-up details
 * @param res - Express Response object
 * @param next - Express Next function for error handling
 */
const signup = asyncFunctionHandler(async (req, res, next) => {
  await services.signUp(req.body);
  res
    .status(200)
    .json({ statusCode: 200, message: successMessages.signUpSuccess });
});

/**
 * Handles user signup verification. Utilizes the asyncFunctionHandler middleware
 * to manage asynchronous operations. Verifies the user's signup using the provided
 * request and response objects. Responds with the appropriate status code and
 * verification details.
 *
 * @param req - Express Request object containing user signup verification details
 * @param res - Express Response object
 * @param next - Express Next function for error handling
 */
const signUpVerification = asyncFunctionHandler(async (req, res, next) => {
  await services.signUpVerification(req, res);
});

/**
 * Handles user login. It utilizes the asyncFunctionHandler middleware
 * to manage asynchronous operations. If the login is successful, it responds
 * with the appropriate status code and user authentication details.
 *
 * @param req - Express Request object containing user login details
 * @param res - Express Response object
 * @param next - Express Next function for error handling
 */
const login = asyncFunctionHandler(async (req, res, next) => {
  await services.login(req, res);
});

/**
 * Handles Google Sign-in authentication. If successful, it responds with a 201 status code,
 * a success message, and a token for the authenticated user.
 * If the Google Sign-in fails, it passes the error to the error-handling middleware.
 *
 * @param req - Express Request object containing Google Sign-in details
 * @param res - Express Response object
 * @param next - Express Next function for error handling
 */
const googleSignin = async (req, res, next) => {
  try {
    const googleLogin = await services.googleSignin(req.user);
    if (googleLogin) {
      res.status(201).json({
        statusCode: 201,
        message: successMessages.signUpSuccess,
        token: googleLogin,
      });
    }
  } catch (error) {
    next(error);
  }
};

export { signup, signUpVerification, login, googleSignin };
