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

//**** PROTECTED ROUTES *******
router.use(authController.protect); // Authenticates the user

/*
 * Header - jwt --> protect
 * Body - oldPassword --> verifyUser
 *        password, confirmPassword --> resetPassword
 */
router.route('/logout').get(authController.logout);
router.route('/updateMyPassword').patch(
  authController.validateUser, // Ensures only the user knowing curr pass can change it
  authController.resetPassword // actually resets the pass
);
router.route('/me').get(userController.getMe, userController.getUser);
router
  .route('/updateMe')
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.route('/deleteMe').delete(
  authController.validateUser, //currentPassword
  userController.deleteMe //deactivates user account
);

/***** ADMINISTRATOR ONLY ROUTES *******/
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    authController.restrictTo('admin', 'lead-guide'),
    userController.updateUser
  ) // DO NOT use this to update passwords
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    userController.deleteUser
  );

module.exports = router;
