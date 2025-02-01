/* eslint-disable func-names */
import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import {
  admin,
  female,
  male,
  other,
  user,
  defaultSignupType,
  signupTypes,
} from '../common/constant.js';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: [male, female, other],
      default: male,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
    },
    password: {
      type: String,
    },
    verificationStatus: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    role: {
      type: String,
      enum: [user, admin],
      default: user,
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    signinType: {
      type: String,
      enum: signupTypes,
      default: defaultSignupType,
    },
  },
  { timestamps: true },
);

/**
 * Custom method to serialize user details to JSON, removing sensitive or unnecessary information.
 *
 * @returns {object} A JSON object containing user details with sensitive or unnecessary fields removed.
 */
userSchema.methods.toJSON = function () {
  const userDetails = this.toObject();
  delete userDetails.password;
  delete userDetails.verificationToken;
  delete userDetails.resetPasswordToken;
  delete userDetails.signupType;
  delete userDetails.__v;
  return userDetails;
};
/**
 * Pre-save middleware for the user schema to hash the user's password before saving to the database.
 *
 * This middleware checks if a password is provided. If a password is found, it generates a salt and hashes the password
 * using bcrypt before saving it to the database. If no password is provided, it proceeds to the next middleware.
 */
userSchema.pre('save', async function (next) {
  if (!this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  next();
});

/**
 * Method to validate a password against the user's stored hashed password.
 *
 * This method compares a provided plain text password with the user's stored hashed password to determine if they match.
 *
 * @param {string} password - The plain text password to be validated.
 * @returns {Promise<boolean>} A Promise that resolves to true if the passwords match, and false if they don't.
 */

userSchema.methods.validatePassword = function (passwords) {
  return bcrypt.compare(passwords, this.password);
};
const User = model('User', userSchema);
export default User;
