import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (name, email) => {
  try {
    const res = await axios({
      method: 'patch',
      url: 'http://localhost:8000/api/v1/users/updateMe',
      data: {
        name,
        email,
      },
    });
    console.log(res.data.data);
    if (res.data.status === 'success') {
      showAlert('success', 'Details updated successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
