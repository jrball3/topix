const mongoose = require('mongoose')
const validator = require('validator')
const timestamp = require('./plugins/timestamp')
const Passwords = require('../utilities/passwords')
const friends = require('mongoose-friends')

const userSchema = new mongoose.Schema({
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
  passwordHash: {
    type: String,
    required: true
  },
  games: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
  }],
})

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id  
    delete ret.passwordHash
    delete ret.games
    return ret
  }
});

userSchema.methods.addGame = function (game) {
  this.games.push(game)
}

userSchema.plugin(timestamp)
userSchema.plugin(friends())

userSchema.methods.authenticate = function (password) {
  return Passwords.compare(password, this.passwordHash)
}

userSchema.statics.friendshipBetween = async function(user1, user2) {
  const user = await this.findOne({'_id': user1._id, 'friends._id': user2._id})
    .select('friends')
    .exec();
  const fs = user && user.friends[0];
  return fs;
}

userSchema.statics.areFriends = async function(user1, user2) {
  const user = await this.findOne({'_id': user1._id, 'friends._id': user2._id})
    .select('friends')
    .exec()
  const fs = user && user.friends[0];
  return fs && fs.status === 'accepted';
}

module.exports = mongoose.model('User', userSchema);
