const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

exports.writeReview = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const review = await Review.createReview(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.getAllReviews();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
