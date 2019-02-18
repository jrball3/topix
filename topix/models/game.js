const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')
const GameType = require('./game-type')
const GameBalance = require('./game-balance')

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: Object.keys(GameType).map(function (key) { return GameType[key] })
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  gameBalances: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameBalance'
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

gameSchema.plugin(timestamp)

gameSchema.post('save', function (doc) {
  doc.users.forEach((user) => {
    GameBalance.balanceFor(doc, { _id: user })
      .save()
      .then((doc) => {
        doc.gameBalances.push(doc._id)
      })
      .catch((doc) => {
        throw Error(`Could not save GameBalance for game ${doc}, user ${user}`)
      })
  })
})

module.exports = mongoose.model('Game', gameSchema)
