const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const contFactory = require('./controllerFactory');

const filterObj = (obj, ...allowedFields) => {
  const result = {};

  Object.keys(obj).forEach((field) => {
    if (allowedFields.includes(field)) result[field] = obj[field];
  });

  return result;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError(
        400,
        'You cannot update password here. Please use /changePassword endpoint for password updates'
      )
    );

  const filteredObj = filterObj(req.body, 'name', 'email');

  if (Object.keys(filteredObj).length === 0)
    return next(new AppError(400, 'No valid parameter found'));

  const updatedUser = await User.updateDoc(req.user._id, filteredObj);

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // If it comes all the way to this function, that means
  // id is valid and user exists
  const user = await User.updateDoc(req.user._id, { active: false });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined!',
  });
};

exports.getAllUsers = contFactory.getAll(User);
exports.getUser = contFactory.getOne(User);
exports.updateUser = contFactory.updateOne(User);
exports.deleteUser = contFactory.deleteOne(User);
