const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

exports.getAllTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.getAllTours(req.query);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });

  //404
});

exports.getTour = catchAsync(async (req, res, next) => {
  // req.params
  const tour = await Tour.getTour(req.params.id);

  if (!tour) {
    next(new AppError(404, 'No tour found with this ID'));
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });

  //404
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.createTour(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  //400
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.updateTour(req.params.id, req.body);

  if (!tour) {
    next(new AppError(404, 'No tour found with this ID'));
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  //400
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.deleteTour(req.params.id);

  if (!tour) {
    next(new AppError(404, 'No tour found with this ID'));
    return;
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
  //404
});
