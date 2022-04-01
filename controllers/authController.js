const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const Email = require('./../utils/email');

const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendJWT = (user, statusCode, res) => {
  const token = generateJWT(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //means browser is not allowed to change the cookie value
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        name: user.name,
        email: user.email,
      },
    },
  });
};

const verifyAsync = async function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // We shouldn't simply pass whatever we get when creating user, we rather choose
  const newUser = await User.createDoc({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    photo: req.body.photo,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWlcmMail();

  createSendJWT(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError(400, 'Both email and password are mandatory'));
    return;
  }

  const user = await User.validateUser(email, password);

  if (!user) {
    next(new AppError(401, 'Invalid email or password'));
    return;
  }

  createSendJWT(user, 200, res);
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'none', {
    // COOKIE expires in 2 seconds
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true, //means browser is not allowed to change the cookie value
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1. get token value and check if exists
  let token;

  if (req.headers.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) return next(new AppError(401, 'login to access this endpoint'));

  // 2. Verify the token
  const decoded = await verifyAsync(token);

  // 3. Check if user still exists
  const user = await User.getUserById(decoded.id);

  if (!user)
    return next(
      new AppError(401, 'The user belonging to this token no longer exists')
    );

  // 4. If password changed since the given JWT was issued
  if (user.wasPassChgAfterJWT(decoded.iat))
    return next(
      new AppError(
        401,
        'Password has been modified, please login with new Pass to get new token'
      )
    );

  req.user = user;
  res.locals.user = user;
  next();
});

// only for the rendered content, no errors thrown
exports.isLoggedIn = async (req, res, next) => {
  if (!req.cookies.jwt) return next();

  try {
    // 2. Verify the token
    const decoded = await verifyAsync(req.cookies.jwt);

    // 3. Check if user still exists
    const user = await User.getUserById(decoded.id);

    if (!user) return next();

    // 4. If password changed since the given JWT was issued
    if (user.wasPassChgAfterJWT(decoded.iat)) return next();

    // This adds user object as a variable inside all the pug templates
    res.locals.user = user;
    next();
  } catch (err) {
    return next();
  }
};

exports.validateUser = catchAsync(async (req, res, next) => {
  const currUser = await User.validateUser(
    req.user.email,
    req.body.currentPassword
  );

  if (!currUser)
    return next(new AppError(401, 'Incorrect Password, please try again!'));

  next();
});

exports.restrictTo = (...roles) => {
  return function (req, res, next) {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(403, 'You are not permitted to perform this action')
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user from the email provided
  const user = await User.getUserByEmail(req.body.email);

  if (!user)
    return next(
      new AppError(404, `No user found with this email: ${req.body.email}`)
    );

  // 2. Generate a password reset token
  const resetToken = user.genPasswordResetToken(); //the user obj is modified and needs to be saved
  await user.save({ validateBeforeSave: false });

  // 3. email the token to the user
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPassResetMail();

    res.status(200).json({
      status: 'success',
      message: "Reset Link sent to user's email",
    });
  } catch (err) {
    // Then we need to dicard the token from DB
    user.discardPasswordResetChanges();
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(500, "Couldn't send the email, Please try again later!")
    );
  }
});

exports.validateResetToken = catchAsync(async (req, res, next) => {
  //1. Get the token parameter
  const resetToken = req.params.token;

  // 2. Get user based on token
  const currUser = await User.validateResetToken(resetToken);

  if (!currUser) {
    return next(new AppError(404, 'Invalid Token or the Token has expired'));
  }

  currUser.discardPasswordResetChanges();
  req.user = currUser;
  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1.  pass and confirmPass from the body
  const { password, confirmPassword } = req.body;
  const currUser = req.user;

  // 2. update password and call the save method
  currUser.password = password;
  currUser.confirmPassword = confirmPassword;
  await currUser.save(); //we want the validation to run

  // 4. login the user i.e., send JWT
  createSendJWT(currUser, 200, res);
});
