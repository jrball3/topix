const mongoose = require('mongoose')
const validator = require('validator')
const timestamp = require('./plugins/timestamp')
const Passwords = require('../utilities/passwords')
const friends = require('./plugins/mongoose-friends/plugin')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 100
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
    minlength: 2,
    maxlength: 30
  },
  displayName: String,
  passwordHash: {
    type: String,
    required: true
  }
})

userSchema.plugin(timestamp)
userSchema.plugin(friends())

userSchema.methods.authenticate = function (password) {
  return Passwords.compare(password, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)
