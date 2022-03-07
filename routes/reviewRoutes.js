const express = require('express');

const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

// Inorder to be able to pass tourId coming from tourRouter
const router = express.Router({ mergeParams: true });

// POST /tours/:tourId/reviews -- Nested
// POST /reviews               -- tour passed in body
// GET /tours/:tourId/reviews  -- tour reviews only
// GET /reviews                -- All reviews
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews) //get all reviews
  .post(
    //Only logged in users can add reviews
    authController.restrictTo('user'), //Should only be for users who book the tour
    reviewController.setTourUserIds,
    reviewController.writeReview
  );

router
  .route('/:id')
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
