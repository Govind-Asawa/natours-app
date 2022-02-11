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
});

// encrypt
userSchema.pre('save', async function (next) {
  //Encrypt only if the password was modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  //Do not save confirmPassword to DB, we simply set it to undefined
  if (this.confirmPassword) this.confirmPassword = undefined;
});

const User = mongoose.model('User', userSchema);

exports.createUser = async function (obj) {
  return await User.create(obj);
};

exports.getUser = async (id) => {
  return await User.findById(id);
};

exports.getAllUsers = async () => {
  return await User.find();
};
