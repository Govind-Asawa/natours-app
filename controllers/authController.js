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

exports.protect = catchAsync(async (req, res, next) => {
  // 1. get token value and check if exists
  let token;

  if (req.headers.authorization?.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token) return next(new AppError(401, 'login to access this endpoint'));

  // 2. Verify the token
  const decoded = await verifyAsync(token);

  // 3. Check if user still exists
  const user = await User.getUser(decoded.id);

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

  next();
});

const verifyAsync = async function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};
