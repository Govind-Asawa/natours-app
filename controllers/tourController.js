const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const contFactory = require('./controllerFactory');

exports.bestFiveTours = function (req, res, next) {
  req.query = {
    limit: 5,
    sort: '-ratingsAverage,price',
  };
  next();
};

exports.getStats = catchAsync(async (req, res, next) => {
  const tours = await Tour.getStats();

  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });

  //400
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const tours = await Tour.getMonthlyPlan(year);

  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });

  //400
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, unit, location } = req.params;
  const radius = distance / (unit === 'mi' ? 3963.2 : 6378.1);
  const [lat, lng] = location.split(',');

  if (!(lat && lng))
    return next(
      new AppError(400, 'please provide latitude and longitude as lat,lng')
    );

  const tours = await Tour.getToursWithin(lat, lng, radius);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { unit, location } = req.params;
  const multiplier = unit === 'mi' ? 0.0006 : 0.001;
  const [lat, lng] = location.split(',');

  if (!(lat && lng))
    return next(
      new AppError(400, 'please provide latitude and longitude as lat,lng')
    );

  const distances = await Tour.getDistances(lat, lng, multiplier);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      distances,
    },
  });
});

exports.getAllTours = contFactory.getAll(Tour);
exports.getTour = contFactory.getOne(Tour);
exports.createTour = contFactory.createOne(Tour);
exports.updateTour = contFactory.updateOne(Tour);
exports.deleteTour = contFactory.deleteOne(Tour);
