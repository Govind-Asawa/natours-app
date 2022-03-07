const APIFeatures = require('./../utils/apiFeatures');

exports.createDoc = (Model) =>
  async function (obj) {
    return await Model.create(obj);
  };

exports.getDoc = (Model, populateFields) =>
  async function (id) {
    const query = Model.findById(id);

    return await (populateFields ? query.populate(populateFields) : query);
  };

exports.getAllDocs = (Model) =>
  async function (filter) {
    const apiFeatures = new APIFeatures(Model.find(), filter);
    apiFeatures.filter().sort().select().paginate();

    //  EXEC THE QUERY BY AWAITING IT
    return await apiFeatures.query;
  };

exports.updateDoc = (Model) =>
  async function (id, obj) {
    return await Model.findByIdAndUpdate(id, obj, {
      new: true,
      runValidators: true,
    });
  };

exports.deleteDoc = (Model) =>
  async function (id) {
    return await Model.findByIdAndDelete(id);
  };

exports.deleteAllDocs = (Model) =>
  async function () {
    return await Model.deleteMany();
  };
