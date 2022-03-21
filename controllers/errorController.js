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

const handleJWTExpiredError = () =>
  new AppError(401, 'Token expired, please login');

const handleJWTInvalidError = () =>
  new AppError(401, 'Invalid token, please login');

const devError = (req, res, err) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: { ...err },
      stackTrace: err.stack,
    });
  }

  // RENDER WEBSITE
  res.status(res.statusCode).render('error', {
    title: 'Something went wrong!',
    message: err.message,
  });
};

const prodError = (req, res, err) => {
  if (req.originalUrl.startsWith('/api')) {
    //we wish to show the message only when the error is operational i.e., trusted
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    //else we just wanna give a very general error without revealing error details
    return res.status(500).json({
      status: 'error',
      message: 'Something wrong happened!',
    });
  }

  // RENDER WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      message: err.message,
    });
  }
  //else we just wanna give a very general error without revealing error details
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    message: 'Please try Again Later',
  });
};

// Gloal Error handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devError(req, res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    if (err.name === 'JsonWebTokenError') {
      error = handleJWTInvalidError();
    }

    prodError(req, res, error);
  }
};
