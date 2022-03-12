const mongoose = require('mongoose');
const modelFactory = require('./modelFactory');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Tour must have duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have difficulty'],
      eum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty can only be one of easy, medium or hard',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a group size'],
    },
    price: {
      type: Number,
      required: [true, 'Tour must have price'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Average rating cannot be less than 1'],
      max: [5, 'Average rating cannot be more than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have a cover img'],
      select: false,
    },
    images: {
      type: [String],
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, duration: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: 'name photo email',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

exports.getAllDocs = modelFactory.getAllDocs(Tour);
// Populating the virtual field
exports.getDoc = modelFactory.getDoc(Tour, 'reviews');
exports.createDoc = modelFactory.createDoc(Tour);
exports.updateDoc = modelFactory.updateDoc(Tour);
exports.deleteDoc = modelFactory.deleteDoc(Tour);
exports.deleteAll = modelFactory.deleteAllDocs(Tour);

exports.getToursWithin = async (lat, lng, radius) => {
  return await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
};

exports.getDistances = async (lat, lng, multiplier) => {
  return await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
};

exports.getStats = async () => {
  // select count(*) as numTours, avg(ratingsAverage) as avgRating,.. from Tours where ratingsAverage > 4.5

  return await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numReviews: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { avgPrice: { $lte: 1700 } },
    // },
  ]);
};

exports.getMonthlyPlan = async (year) => {
  return await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $addFields: {
        year: { $year: { date: '$startDates' } },
        month: { $month: { date: '$startDates' } },
        name: '$name',
      },
    },
    {
      $match: { year: year },
    },
    {
      $group: {
        _id: '$month',
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 }, // 0 means remove and 1 means keep
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
};
