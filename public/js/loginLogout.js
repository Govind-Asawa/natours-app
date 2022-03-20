import axios from 'axios';
import { showAlert } from './alert';

export async function login(email, password) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

export const logout = async (e) => {
  try {
    const res = await axios({
      method: 'get',
      url: 'http://localhost:8000/api/v1/users/logout',
    });

    console.log(res.data);
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully');
      window.setTimeout(() => {
        location.assign('/login');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', 'error logging out. Try again!');
  }
};
