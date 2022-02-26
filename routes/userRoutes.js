const userController = require('../controllers/userController');

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
router.route('/changePassword').patch(
  authController.protect, // Authenticates the user
  authController.validateUser, // Ensures only the user knowing curr pass can change it
  authController.resetPassword // actually resets the pass
);

router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);

router.route('/deleteMyAccount').delete(
  authController.protect, //jwt
  authController.validateUser, //currentPassword
  userController.deleteMyAccount //deactivates user account
);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
