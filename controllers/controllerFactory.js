const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.createDoc(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.getDoc(req.params.id);

    if (!doc) {
      next(new AppError(404, 'No document found with this ID'));
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.updateDoc(req.params.id, req.body);

    if (!doc) return next(new AppError(404, 'No document found with this ID'));

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.deleteDoc(req.params.id);

    if (!doc) return next(new AppError(404, 'No document found with this ID'));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
