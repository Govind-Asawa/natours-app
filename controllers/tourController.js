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

exports.getAllTours = contFactory.getAll(Tour);
exports.getTour = contFactory.getOne(Tour);
exports.createTour = contFactory.createOne(Tour);
exports.updateTour = contFactory.updateOne(Tour);
exports.deleteTour = contFactory.deleteOne(Tour);
