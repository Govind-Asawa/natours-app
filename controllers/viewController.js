const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.setSecurityPolicy = (_, res, next) => {
  res.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com https://*.stripe.com/v3/ ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  );
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.getAllDocs({});

  res
    .status(200)
    .render('overview', {
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.getTourBySlug(slug);

  if (!tour)
    return next(new AppError(404, 'No tour could be found with this name.'));

  res
    .status(200)
    .render('tour', {
      title: `${tour.name} tour`,
      tour,
    });
});

exports.getLoginForm = (req, res, next) => {
  res
    .status(200)
    .render('login', {
      title: 'log into your Account',
    });
};

exports.getAccount = (req, res, next) => {
  res
    .status(200)
    .render('account', {
      title: 'Your account details',
    });
};
