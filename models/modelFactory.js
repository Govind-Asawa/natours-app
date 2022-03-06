exports.createDoc = (Model) =>
  async function (obj) {
    return await Model.create(obj);
  };

exports.getDoc = (Model, populateFields) =>
  async function (id) {
    const query = Model.findById(id);

    return await (populateFields ? query.populate(populateFields) : query);
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
