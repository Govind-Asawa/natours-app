const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
exports.createUser = async function (obj) {
  return await User.create(obj);
};

/**
 * @returns
 * null - if invalid email or password
 * user - if authenticated successfully
 */
exports.validateUser = async (email, plainPass) => {
  //have to explicitly select password
  const user = await User.findOne({ email }).select('+password');
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

exports.getUserById = async (id) => {
  return await User.findById(id);
};

exports.getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

exports.getAllUsers = async () => {
  return await User.find();
};
