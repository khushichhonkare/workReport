/* eslint-disable func-names */
import { body, check, validationResult } from 'express-validator';
import userSchema from '../models/authModel.js';
import {
  male,
  female,
  other,
  user,
  admin,
  phoneNumberRegex,
  alphabetsRegex,
  emailRegex,
  strongPasswordRegex,
  adminRegex,
  genderRegex,
  fieldMessage,
} from '../common/constant.js';
import errorMessages from '../common/errorMessages.js';

const gender = {
  Male: male,
  Female: female,
  Other: other,
};
const role = {
  User: user,
  Admin: admin,
};
const isDuplicateEmail = async (req, res, next) => {
  const existingEmail = await userSchema.findOne({ email: req.body.email });
  const existingNumber = await userSchema.findOne({
    contactNumber: req.body.contactNumber,
  });
  if (existingEmail) {
    res
      .status(400)
      .json({ statusCode: 400, message: errorMessages.emailAlreadyExists });
  } else if (existingNumber) {
    res.status(400).json({
      statusCode: 400,
      message: errorMessages.contactNumberAlreadyExists,
    });
  } else next();
};
const ErrorValidatorFunction = async function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorResponse = {};

    errors.array().forEach((error) => {
      if (error.type === 'field') {
        const { path, msg } = error;
        errorResponse[path] = msg;
      } else if (error.type === 'unknown_fields') {
        const { type, msg } = error;
        errorResponse[type] = msg;
      }
    });
    console.log(errorResponse);
    return res.status(400).json({ errors: errorResponse });
  }
  next();
};
const validateSignUpFields = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage(errorMessages.fieldEmpty.replace('fieldName', 'firstName'))
    .bail()
    .matches(alphabetsRegex)
    .withMessage(errorMessages.invalidFirstNameField),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage(errorMessages.fieldEmpty.replace('fieldName', 'lastName'))
    .bail()
    .matches(alphabetsRegex)
    .withMessage(errorMessages.invalidLastNameField),
  body('role')
    .optional()
    .trim()
    .matches(adminRegex)
    .withMessage(errorMessages.invalidRoleField),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage(errorMessages.fieldEmpty.replace('fieldName', 'gender'))
    .bail()
    .matches(genderRegex)
    .withMessage(errorMessages.invalidGenderField),
  body('email')
    .trim()
    .notEmpty()
    .withMessage(errorMessages.fieldEmpty.replace('fieldName', 'email'))
    .bail()
    .matches(emailRegex)
    .withMessage(errorMessages.invalidEmailField),
  body('contactNumber')
    .trim()
    .notEmpty()
    .withMessage(errorMessages.fieldEmpty.replace('fieldName', 'contactNumber'))
    .bail()
    .matches(phoneNumberRegex)
    .withMessage(errorMessages.invalidContactNumberField),
  body('password')
    .trim()
    .notEmpty()
    .withMessage(errorMessages.fieldEmpty.replace('fieldName', 'password'))
    .bail()
    .matches(strongPasswordRegex)
    .withMessage(errorMessages.invalidPasswordField),
  body('confirmPassword')
    .notEmpty()
    .withMessage(
      errorMessages.fieldEmpty.replace('fieldName', 'confirmPassword'),
    )
    .bail()
    .custom(async (confirmPassword, { req }) => {
      const { password } = req.body;
      if (password !== confirmPassword) {
        throw new Error(errorMessages.passwordsMatch);
      }
    }),
];
const logInValidation = [
  body('Invalid body').custom(async (value, { req }) => {
    if (!req.body.email && !req.body.contactNumber) {
      throw new Error(errorMessages.loginFieldEmpty);
    }
  }),
  body('email')
    .optional()
    .trim()
    .matches(emailRegex)
    .withMessage(errorMessages.invalidEmailField),
  body('contactNumber')
    .optional()
    .trim()
    .matches(phoneNumberRegex)
    .withMessage(errorMessages.invalidContactNumberField),
  body('password').notEmpty().withMessage(errorMessages.passwordFieldEmpty),
];

export {
  validateSignUpFields,
  logInValidation,
  ErrorValidatorFunction,
  isDuplicateEmail,
};
