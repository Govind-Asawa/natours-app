import '@babel/polyfill';
import { login, logout } from './loginLogout';
import { displayLoc } from './mapbox';
import { updateSettings } from './updateUser';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.login-form .form');
const logoutBtn = document.getElementById('logout-btn');
const saveData = document.getElementById('save-data');
const savePassword = document.getElementById('save-password');

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

if (saveData) {
  saveData.addEventListener('click', (e) => {
    e.preventDefault();

    var form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (savePassword) {
  savePassword.addEventListener('click', async (e) => {
    e.preventDefault();

    const origContent = savePassword.textContent;
    savePassword.textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    await updateSettings(
      { currentPassword, password, confirmPassword },
      'password'
    );

    savePassword.textContent = origContent;
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
