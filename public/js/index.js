import '@babel/polyfill';
import { login } from './login';
import { displayLoc } from './mapbox';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form .form');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayLoc(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}
