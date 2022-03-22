import axios from 'axios';
import { showAlert } from './alert';

// type is either data or password
export const updateSettings = async (data, type) => {
  try {
    const url =
      'http://localhost:8000/api/v1/users' +
      (type == 'data' ? '/updateMe' : '/updateMyPassword');

    const res = await axios({
      method: 'patch',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
