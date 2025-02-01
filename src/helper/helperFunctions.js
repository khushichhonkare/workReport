/**
 * Middleware function that handles asynchronous route handlers by wrapping them with error handling.
 *
 * @param {Function} asyncFunction - An asynchronous route handler function to be wrapped with error handling.
 * @returns {Function} A middleware function that executes the provided asyncFunction and forwards errors to the next middleware.
 */
const asyncFunctionHandler = (asyncFunction) => async (req, res, next) => {
  try {
    await asyncFunction(req, res, next);
  } catch (error) {
    next(error);
  }
};
export default asyncFunctionHandler;
