class AppError extends Error {
  constructor(statusCode, msg) {
    super();

    this.message = msg;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    //This is to mark that the error can be trusted and is smth recognized by us
    this.isOperational = true;

    Error.captureStackTrace(this, this.contructor);
  }
}

module.exports = AppError;
