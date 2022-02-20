const tourController = require('../controllers/tourController');
const { getAllTours, createTour, getTour, updateTour, deleteTour } =
  tourController;

const authController = require('./../controllers/authController');

const express = require('express');

const router = express.Router();

router.route('/best-5-tours').get(tourController.bestFiveTours, getAllTours);
router.route('/stats').get(tourController.getStats);
router.route('/monthly-plan/:year').get(tourController.monthlyPlan);
router.route('/').get(authController.protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour
  );

module.exports = router;
