const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const contFactory = require('./controllerFactory');

exports.setTourUserIds = (req, res, next) => {
  // Adjusting for nested route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user._id;

  next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter.tour = req.params.tourId;

  const reviews = await Review.getAllReviews(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.writeReview = contFactory.createOne(Review);
exports.updateReview = contFactory.updateOne(Review);
exports.deleteReview = contFactory.deleteOne(Review);
