const usersRouter = require('./routes/userRoutes');
const toursRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const express = require('express');
const logger = require('morgan');

const app = express();

// console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') app.use(logger('dev'));

app.use(express.json()); //NOTE --- Middleware to add body to req

// MOUNTING ROUTERS -- Routers will define the middlewares that are expected to end the req-res cycle
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

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
