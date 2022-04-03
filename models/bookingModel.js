const mongoose = require('mongoose');
const modelController = require('./modelFactory');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'userId of a booking is required'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'tourId of a booking is required'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must contain price'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: String,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  });
  // .populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

exports.getUserBookings = async (userId) => {
  return await Booking.find({ user: userId });
};

exports.createDoc = modelController.createDoc(Booking);
exports.getDoc = modelController.getDoc(Booking);
exports.updateDoc = modelController.updateDoc(Booking);
exports.deleteDoc = modelController.deleteDoc(Booking);
exports.getAllDocs = modelController.getAllDocs(Booking);
