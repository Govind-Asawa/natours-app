const usersRouter = require('./routes/userRoutes');
const toursRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const express = require('express');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// MIDDLEWARES

//set security headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') app.use(logger('dev'));

// Rate limiting the number of requests to the API from same IP
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 100,
  message: 'Too many API requests from this IP, please try again after 0.5hrs',
});

app.use('/api', limiter);

// Body parser, to parse the body and add it to req.body
// and also setting payload limit
app.use(express.json({ limit: '10kb' })); //NOTE --- Middleware to add body to req

//Input sanitization against NoSql query inject0ion
app.use(mongoSanitize());

// Encoding possible HTML tags to prevent XSS
app.use(xss());

// Dealing with parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'difficulty'],
  })
);

// MOUNTING ROUTERS -- Routers will define the middlewares that are expected to end the req-res cycle
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);

// Req would come down to this point only if it was not handled, which means the server
//has been requested for a resource we do not respond to -- so we send 404
//all --> all the http methods
//*   --> all the urls
app.all('*', (req, res, next) => {
  //This signals we are calling our global err handler
  next(new AppError(404, `Couldn't find ${req.originalUrl} in the server!`));
});

//GLOBAL Error Handler
app.use(globalErrorHandler);
module.exports = app;
