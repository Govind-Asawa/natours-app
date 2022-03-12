const mongoose = require('mongoose');
const modelFactory = require('./modelFactory');
const Tour = require('./tourModel');

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

reviewSchema.statics.updateTourStats = async function (tourId) {
  // this keyword points to the Review model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // Incase all the reviews are deleted, stats would be an empty array
  // In this situation we should assign default values
  await Tour.updateDoc(tourId, {
    ratingsAverage: stats[0]?.avgRating ?? 4.5,
    ratingsQuantity: stats[0]?.nRatings ?? 1,
  });
};

reviewSchema.post('save', function (doc, next) {
  // this/doc keyword points to the doc saved which is of type Review Model
  doc.constructor.updateTourStats(doc.tour);
  next();
});

reviewSchema.post(/^findOneAnd/, function (doc, next) {
  // Doc is the updated/deleted document
  // this is to handle update and delete to reviews, as save hook is not triggered incase of
  // findOneAndUpdate [Delete]
  if (doc) doc.constructor.updateTourStats(doc.tour);
  next();
});
const Review = mongoose.model('Review', reviewSchema);

exports.getAllDocs = modelFactory.getAllDocs(Review);
exports.createDoc = modelFactory.createDoc(Review);
exports.updateDoc = modelFactory.updateDoc(Review);
exports.deleteDoc = modelFactory.deleteDoc(Review);
exports.deleteAll = modelFactory.deleteAllDocs(Review);
