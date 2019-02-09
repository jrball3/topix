const mongoose = require('mongoose')
const validator = require('validator')
const timestamp = require('./plugins/timestamp')
const Passwords = require('../utilities/passwords')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
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
    lowercase: true
  },
  displayName: String,
  passwordHash: {
    type: String,
    required: true
  },
  createdAt: Date,
  updatedAt: Date
})

userSchema.plugin(timestamp)

userSchema.methods.authenticate = function (password) {
  return Passwords.compare(password, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)
