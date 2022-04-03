const express = require('express');
const viewController = require('./../controllers/viewController');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(viewController.setSecurityPolicy);

router.get(
  '/',
  bookingController.createBookingCheckout, //to create booking, set as payment's success_url
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

module.exports = router;
