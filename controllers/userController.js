const fs = require('fs');
const multer = require('multer');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const contFactory = require('./controllerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  // We only wish to accept files of type image
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError(400, 'Please upload files of image type only.'), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

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

  if (req.file) {
    filteredObj.photo = req.file.filename;
    // DELETING THE PREV FILE
    const path = `public/img/users/${req.user.photo}`;
    fs.stat(path, (err) => {
      if (!err) fs.unlink(path, (err) => {});
    });
  }

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
