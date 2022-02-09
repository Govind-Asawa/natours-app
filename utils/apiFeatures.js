class APIFeatures {
  constructor(query, queryStr) {
    this.query = query; //Mongoose Query Object
    this.queryStr = queryStr; //req.query
  }

  filter() {
    let qObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((param) => {
      delete qObj[param];
    });

    let qStr = JSON.stringify(qObj);
    qStr = qStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    qObj = JSON.parse(qStr);

    this.query = this.query.find(qObj);

    return this;
  }

  sort() {
    if (this.queryStr.sort)
      this.query = this.query.sort(this.queryStr.sort.replace(',', ' '));
    else this.query = this.query.sort('-createdAt');

    return this;
  }

  paginate() {
    // At this point it is specific to Tour Model
    const page = this.queryStr.page * 1 || 1; // page * 1 to convert it to Number
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (this.queryStr.page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  select() {
    if (this.queryStr.fields)
      this.query = this.query.select(this.queryStr.fields.replace(',', ' '));
    else this.query = this.query.select('-__v');

    return this;
  }
}

module.exports = APIFeatures;
