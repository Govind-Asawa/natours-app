import axios from 'axios';
import { showAlert } from './alert';

let stripe;

const getStripe = () =>
  (stripe = Stripe(
    'pk_test_51KjfG5SBBXa6ryTkzTmLX2FvZjQWdN80gMC4pNA9iSx7xzxro3GCIJDtKBuZHRxVh5zueVq6gRf2seWJ9HF02PLj00fkACoUE1'
  ));

export async function bookTour(tourId) {
  try {
    // 1. get checkout Session
    const response = await axios(
      `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`
    );

    const session = response.data.session;

    // 2. create checkout form
    await getStripe().redirectToCheckout({
      sessionId: session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
}
