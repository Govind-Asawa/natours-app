import '@babel/polyfill';
import { login, logout } from './loginLogout';
import { displayLoc } from './mapbox';
import { updateSettings } from './updateUser';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form .form');
const logoutBtn = document.getElementById('logout-btn');
const saveSettigns = document.getElementById('save-settings');

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

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (saveSettigns) {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  saveSettigns.addEventListener('click', (e) => {
    e.preventDefault();
    updateSettings(name, email);
  });
}
