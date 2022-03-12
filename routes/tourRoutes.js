const tourController = require('../controllers/tourController');
const { getAllTours, createTour, getTour, updateTour, deleteTour } =
  tourController;

const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const express = require('express');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter); //Nested routing

router.route('/best-5-tours').get(tourController.bestFiveTours, getAllTours);
router.route('/stats').get(tourController.getStats);
router
  .route('/distances/:location/unit/:unit')
  .get(tourController.getDistances);
router
  .route('/tours-within/:distance/unit/:unit/center/:location')
  .get(tourController.getToursWithin);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.monthlyPlan
  );

router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    createTour
  );
router
  .route('/:id')
  .get(getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour
  );

module.exports = router;
