const stripe = require('stripe')(process.env.STRIPE_SECRET);
const controllerFactory = require('./controllerFactory');
const TourModel = require('./../models/tourModel');
const UserModel = require('./../models/userModel');
const BookingModel = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await TourModel.getDoc(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    // success_url: `${req.protocol}://${req.get('host')}/my-tours?tour=${
    //   tour._id
    // }&user=${req.user._id}&price=${tour.price}`,
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
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

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await UserModel.getUserByEmail(session.customer_email))._id;
  const price = session.amount_total / 100;

  await BookingModel.createDoc({ user, tour, price });
};
// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //This is only TEMPORARY
//   const { user, tour, price } = req.query;

//   if (!tour && !user && !price) return next();

//   await BookingModel.createDoc({ user, tour, price });

//   // This is done to visually hide that our app uses query string to create a booking
//   res.redirect(req.originalUrl.split('?')[0]);
// });

exports.createBooking = controllerFactory.createOne(BookingModel);
exports.getBooking = controllerFactory.getOne(BookingModel);
exports.updateBooking = controllerFactory.updateOne(BookingModel);
exports.deleteBooking = controllerFactory.deleteOne(BookingModel);
exports.getAllBookings = controllerFactory.getAll(BookingModel);
