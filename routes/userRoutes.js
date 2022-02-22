const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const authController = require('./../controllers/authController');
const express = require('express');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router
  .route('/resetPassword/:token')
  .patch(authController.validateResetToken, authController.resetPassword);

/*
 * Header - jwt --> protect
 * Body - oldPassword --> verifyUser
 *        password, confirmPassword --> resetPassword
 */
router.route('/changePassword').post(
  authController.protect, // Authenticates the user
  authController.validateUser, // Ensures only the user knowing curr pass can change it
  authController.resetPassword // actually resets the pass
);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
