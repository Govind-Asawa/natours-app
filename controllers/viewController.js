const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.getAllDocs({});

  res.status(200).render('overview', {
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.getTourBySlug(slug);
  console.log(tour.guides);
  res.status(200).render('tour', {
    tour,
  });
});
