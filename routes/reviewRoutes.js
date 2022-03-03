const express = require('express');

const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews) //get all reviews
  .post(
    authController.protect, //Only logged in users can add reviews
    authController.restrictTo('user'), //Should only be for users who book the tour
    reviewController.writeReview
  );

module.exports = router;
