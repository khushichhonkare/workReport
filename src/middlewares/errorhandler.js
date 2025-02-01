import errorMessages from '../common/errorMessages.js';
import messages from '../common/messages.js';
import CustomError from '../helper/customError.js';

const errorHandler = (err, req, res, next) => {
  console.log(err.message, err.error);

  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ message: err.message });
  } else if (err instanceof Error) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    res.status(500).json({ messages: errorMessages.internalServerError });
  }
};

export default errorHandler;
