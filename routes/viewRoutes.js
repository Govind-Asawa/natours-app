const express = require('express');
const viewController = require('./../controllers/viewController');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(viewController.setSecurityPolicy);

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/me', authController.protect, viewController.getAccount);
router.get(
  '/my-tours',
  bookingController.webhookCheckout, //to create booking, set as payment's success_url
  authController.protect,
  viewController.getMyTours
);

module.exports = router;
