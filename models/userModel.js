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
  photo: {
    type: String,
  },
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
  passLastModified: {
    type: Date, //Inserted in the pre-save hook
  },
});

// encrypt
userSchema.pre('save', async function (next) {
  //Encrypt only if the password was modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passLastModified = new Date(); //current time

  //Do not save confirmPassword to DB, we simply set it to undefined
  if (this.confirmPassword) this.confirmPassword = undefined;
});

userSchema.methods.checkPassword = async (plainPass, hashPass) => {
  // cannot use this.password bcz select: false for password
  return await bcrypt.compare(plainPass, hashPass); //true or false
};

userSchema.methods.wasPassChgAfterJWT = function (JWTTimestamp) {
  if (!this.passLastModified) return false;

  return this.passLastModified.getTime() / 1000 > JWTTimestamp;
};

const User = mongoose.model('User', userSchema);

exports.createUser = async function (obj) {
  return await User.create(obj);
};

exports.validateAndGetUser = async (email, plainPass) => {
  //have to explicitly select password
  const user = await User.findOne({ email }).select('+password');
  let result = false;

  if (user) {
    result = await user.checkPassword(plainPass, user.password);
  }

  // result is true only if we have a user and the pass matches, false in all other cases
  return result ? user : null;
};

exports.getUser = async (id) => {
  return await User.findById(id);
};

exports.getAllUsers = async () => {
  return await User.find();
};
