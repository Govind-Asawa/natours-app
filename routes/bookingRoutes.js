const authController = require('./../controllers/authController');
const bookingController = require('../controllers/bookingController');
const express = require('express');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
router
  .route('/')
  .get(authController.restrictTo('admin'), bookingController.getAllBookings)
  .post(
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.createBooking
  );
router
  .route('/:id')
  .get(
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    bookingController.getBooking
  )
  .all(authController.restrictTo('admin', 'lead-guide'))
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
