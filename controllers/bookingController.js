const stripe = require('stripe')(process.env.STRIPE_SECRET);
const TourModel = require('./../models/tourModel');
const BookingModel = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await TourModel.getDoc(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour._id}&user=${
      req.user._id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100, //In cents
        currency: 'inr',
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is only TEMPORARY
  const { user, tour, price } = req.query;

  if (!tour && !user && !price) return next();

  await BookingModel.createBooking({ user, tour, price });

  // This is done to visually hide that our app uses query string to create a booking
  res.redirect(req.originalUrl.split('?')[0]);
});
