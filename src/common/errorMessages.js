// File contains all the error messages

const errorMessages = {
  emailAlreadyExists: 'Email already exists',
  contactNumberAlreadyExists: 'Contact Number already exists',
  errorInDbConnection: 'An error occurred in database connection',
  errorInLogin: 'An error occurred in login',
  tokenVerificationFailed:
    'Link is not valid either token has expired or you are already verified please try login',
  invalidToken: 'Invalid token',
  internalServerError: 'Internal server error',
  loginDataNotMatched: 'Invalid Credentials',
  errorInSignup: 'An error occurred in signup',
  forbidden: 'You do not have permission to access this page.',
  // env variable missing
  dbUrlMissing: 'Either TEST_URL or DEV_URL is required for DB_URL.',

  // validation errors
  invalidReqBody: 'Invalid request body.',
  invalidFirstNameField: 'First name can only have alphabets',
  invalidLastNameField: 'Last name can only have alphabets',
  invalidRoleField: 'Role should be admin or empty',
  invalidGenderField: 'Gender field can only have male/female/other',
  invalidEmailField: 'Please enter a valid Email address.',
  invalidContactNumberField: 'Please enter a valid contactNumber.',
  invalidPasswordField:
    'Your password must be have at least: 8 characters long, 1 uppercase & 1 lowercase character,1 number.',
  passwordsMatch: "Password and confirm password didn't match.",
  loginFieldEmpty: 'Please provide either an email or a contact number.',
  verificationStatusField: 'Cannot change verification status',
  fieldEmpty: ':fieldName field is required.',
};
export default errorMessages;
