const APIFeatures = require('./../utils/apiFeatures');
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
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
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passLastModified',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

exports.createTour = async function (obj) {
  return await Tour.create(obj);
};

exports.getAllTours = async (filter) => {
  const apiFeatures = new APIFeatures(Tour.find(), filter);
  apiFeatures.filter().sort().select().paginate();

  //  EXEC THE QUERY BY AWAITING IT
  return await apiFeatures.query;
};

exports.getTour = async (id) => {
  return await Tour.findById(id);
};

exports.updateTour = async (id, obj) => {
  return await Tour.findByIdAndUpdate(id, obj, {
    new: true,
    runValidators: true,
  });
};

exports.deleteTour = async (id) => {
  return await Tour.findByIdAndDelete(id);
};

exports.deleteAll = async () => {
  return await Tour.deleteMany();
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
