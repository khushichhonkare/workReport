import errorMessages from '../common/errorMessages';

const authorization = (role) => (req, res, next) => {
  const { user } = req;
  if (user.role === role) {
    next();
  } else {
    res.status(403).json({
      statusCode: 403,
      message: errorMessages.forbidden,
    });
  }
};

export default authorization;
