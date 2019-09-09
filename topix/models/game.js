const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')
const GameType = require('./game-type')
const GameStatus = require('./game-status')

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(GameStatus),
    default: GameStatus.PENDING
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(GameType)
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  scores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Score',
  }]
})

gameSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {
    delete ret._id
    return ret
  }}
);

gameSchema.plugin(timestamp)

gameSchema.methods.addPlayer = function (player) {
  this.players.push(player)
}

gameSchema.methods.getLeaderboard = function () {
  try {
    return this.scores.sort({ score: -1 })
  } catch (err) {
    console.error(err)
    throw err
  }
}

module.exports = mongoose.model('Game', gameSchema)
