// this constant variables is used for userModel
const male = 'male';
const female = 'female';
const other = 'other';
const user = 'user';
const admin = 'admin';

// this constant variables is used for signUpValidation

const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneNumberRegex = /^\d{10}$/;
const alphabetsRegex = /^[a-zA-Z ]*$/;
const dobRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const alphaNumericRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$/;
const genderRegex = /^(|male|female|other)$/;
const adminRegex = /^(admin)$/;
const signupTypes = ['google', 'facebook', 'linkedin', 'github', 'email'];
const defaultSignupType = 'email';
// this message for invalid field
const fieldMessage = 'Invalid request fields';

export {
  male,
  female,
  other,
  user,
  admin,
  signupTypes,
  defaultSignupType,
  phoneNumberRegex,
  alphabetsRegex,
  dobRegex,
  emailRegex,
  alphaNumericRegex,
  adminRegex,
  fieldMessage,
  genderRegex,
  strongPasswordRegex,
};
