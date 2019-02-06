const mongoose = require('mongoose')
const validator = require('validator')
const timestamp = require('./plugins/timestamp')

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    lowercase: true
  },
  lastName: {
    type: String,
    lowercase: true
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

module.exports = mongoose.model('User', userSchema)
