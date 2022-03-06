const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const modelFactory = require('./modelFactory');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    unique: [true, 'User email should be unique'],
    lowecase: true,
    validate: [validator.isEmail, 'Invalid Email format'],
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'Only roles allowed are user, guide, lead-guide and admin',
    },
    default: 'user',
  },
  photo: String,
  password: {
    type: String,
    required: true,
    select: false,
    minlength: [6, 'Password should have a min length of 6'],
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      //NOTE: Only works on SAVE
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords dont match',
    },
  },
  passLastModified: Date,
  passwordResetToken: String,
  resetTokenExpiresAfter: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//---- HOOKS
userSchema.pre('save', async function (next) {
  //Encrypt only if the password was modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  //Do not save confirmPassword to DB, we simply set it to undefined
  if (this.confirmPassword) this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passLastModified = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this keyword points to the query obj
  this.find({ active: { $ne: 'false' } });
  next();
});
// ---- User Instance Methods
userSchema.methods.checkPassword = async (plainPass, hashPass) => {
  // cannot use this.password bcz select: false for password
  return await bcrypt.compare(plainPass, hashPass); //true or false
};

userSchema.methods.wasPassChgAfterJWT = function (JWTTimestamp) {
  if (!this.passLastModified) return false;

  return this.passLastModified.getTime() / 1000 > JWTTimestamp;
};

userSchema.methods.genPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // We cannot save this directly into DB, so we encrypt before saving
  this.passwordResetToken = encryptResetToken(resetToken);

  this.resetTokenExpiresAfter =
    Date.now() + Number.parseInt(process.env.RESET_TOKEN_EXPIRES_IN);

  return resetToken;
};

userSchema.methods.discardPasswordResetChanges = function () {
  this.passwordResetToken = undefined;
  this.resetTokenExpiresAfter = undefined;
};

const User = mongoose.model('User', userSchema);

// ---- Utililty Methods
const encryptResetToken = (resetToken) => {
  return crypto.createHash('sha256').update(resetToken).digest('hex');
};

// ---- Public Methods to interact with DB
/**
 * @returns
 * null - if invalid email or password
 * user - if authenticated successfully
 */
exports.validateUser = async (email, plainPass) => {
  //have to explicitly select password
  const user = await exports.getUserByEmail(email, 'password');
  let result = false;

  if (user) {
    result = await user.checkPassword(plainPass, user.password);
  }

  // result is true only if we have a user and the pass matches, false in all other cases
  return result ? user : null;
};

/**
 * null - Invalid token or Token expired;
 * user - if everything is fine
 */
exports.validateResetToken = async (plainResetToken) => {
  const encResetToken = encryptResetToken(plainResetToken);
  const currUser = await User.findOne({
    passwordResetToken: encResetToken,
    resetTokenExpiresAfter: { $gt: Date.now() },
  });

  if (!currUser) return null;

  return currUser;
};

exports.getUserById = async (id, ...allowedFields) => {
  let query = User.findById(id);
  if (allowedFields.length != 0) query.select('+' + allowedFields.join(' +'));

  return await query;
};

exports.getUserByEmail = async (email, ...allowedFields) => {
  let query = User.findOne({ email });
  if (allowedFields.length != 0) query.select('+' + allowedFields.join(' +'));

  return await query;
};

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getDoc = modelFactory.getDoc(User);
exports.createDoc = modelFactory.createDoc(User);
exports.updateDoc = modelFactory.updateDoc(User);
exports.deleteDoc = modelFactory.deleteDoc(User);
