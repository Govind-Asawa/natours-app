const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // We shouldn't simply pass whatever we get when creating user, we rather choose
  const newUser = await User.createUser({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    photo: req.body.photo,
  });

  const token = generateToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError(400, 'Both email and password are mandatory'));
    return;
  }

  const user = await User.validateAndGetUser(email, password);

  if (!user) {
    next(new AppError(401, 'Invalid email or password'));
    return;
  }

  const token = generateToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
  });
});
