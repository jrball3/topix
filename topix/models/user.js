const mongoose = require('mongoose');
const validator = require('validator');
const passwords = require('../utilities/passwords');
const timestamp = require('./plugins/timestamp');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    lowercase: true,
  },
  last_name: {
    type: String,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: (value) => {
      return validator.isEmail(value)
    }
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  display_name: String,
  password_hash: {
    type: String,
    required: true,
  },
  createdAt: Date,
  updatedAt: Date,
});

userSchema.plugin(timestamp);

module.exports = mongoose.model('User', userSchema);
