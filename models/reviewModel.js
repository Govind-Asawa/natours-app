const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: [true, 'description of a review is required'],
  },
  // PARENT REF
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'userId of a review is required'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'tourId of a review is required'],
  },
});

reviewSchema.pre(/^find/, function (next) {
  // Populating the tours would be too much and also, we just need a ref
  // but wont be needing tour info when showing reviews
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

exports.createReview = async (obj) => {
  return await Review.create(obj);
};

exports.getAllReviews = async () => {
  return await Review.find();
};
