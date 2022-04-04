const usersRouter = require('./routes/userRoutes');
const toursRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const express = require('express');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const pug = require('pug');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const app = express();

// To allow Heroku proxies
app.enable('trust proxy');

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// MIDDLEWARES

// CORS
// simple requests
app.use(cors());
// complex requests requires handling pre-flight requests with method OPTIONS
app.options('*', cors());

//set security headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        'child-src': ['blob:'],
        'connect-src': ['https://*.mapbox.com'],
        'default-src': ["'self'"],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'blob:'],
        'script-src': ["'self'", 'https://*.mapbox.com'],
        'style-src': ["'self'", 'https:'],
        'worker-src': ['blob:'],
      },
    },
  })
);
// Development logging
if (process.env.NODE_ENV === 'development') app.use(logger('dev'));

// Rate limiting the number of requests to the API from same IP
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 100,
  message: 'Too many API requests from this IP, please try again after 0.5hrs',
});

app.use('/api', limiter);

// STRIPE'S checkout.session.completed event
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body parser, to parse the body and add it to req.body
// and also setting payload limit
app.use(express.json({ limit: '10kb' })); //NOTE --- Middleware to add body to req
// Parses formdata if any and adds it to req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Cookie parser
app.use(cookieParser());

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

// Compressing the responses
app.use(compression());

// MOUNTING ROUTERS -- Routers will define the middlewares that are expected to end the req-res cycle
app.use('/', viewRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
