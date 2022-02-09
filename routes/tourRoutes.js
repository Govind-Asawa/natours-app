const tourController = require('../controllers/tourController');
const { getAllTours, createTour, getTour, updateTour, deleteTour } =
  tourController;

const express = require('express');

const router = express.Router();

router.route('/best-5-tours').get(tourController.bestFiveTours, getAllTours);
router.route('/stats').get(tourController.getStats);
router.route('/monthly-plan/:year').get(tourController.monthlyPlan);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
