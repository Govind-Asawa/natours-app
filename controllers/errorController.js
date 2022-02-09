const AppError = require('./../utils/appError');

const handleValidationErrorDB = (err) => {
  let msg = '';

  for (field of Object.keys(err.errors)) {
    msg += `${field}: ${err.errors[field].message}`;
  }

  return new AppError(400, msg);
};

const handleCastErrorDB = (err) => {
  const msg = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, msg);
};

const devError = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: { ...err },
    stackTrace: err.stack,
  });
};

const prodError = (res, err) => {
  //we wish to show the message only when the error is operational i.e., trusted
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //else we just wanna give a very general error without revealing error details
  else {
    res.status(500).json({
      status: 'error',
      message: 'Something wrong happened!',
    });
  }
};

// Gloal Error handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devError(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    prodError(res, error);
  }
};
