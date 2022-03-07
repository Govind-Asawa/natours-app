const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');
const contFactory = require('./controllerFactory');

exports.setTourUserIds = (req, res, next) => {
  // Adjusting for nested route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user._id;

  next();
};

exports.getAllReviews = contFactory.getAll(Review);
exports.writeReview = contFactory.createOne(Review);
exports.updateReview = contFactory.updateOne(Review);
exports.deleteReview = contFactory.deleteOne(Review);
