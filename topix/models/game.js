const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')
const GameType = require('./game-type')
const GameStatus = require('./game-status')

const scoreSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  }
})

const balanceSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // call this.markModified('balances') whenver this changes.
  balances: {}
})

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
  balances: [balanceSchema],
  scoreboard: [scoreSchema]
})

gameSchema.plugin(timestamp)

const scoreFor = function (user) {
  const score = { player: user }
  if (this.type === GameType.KARMA_HOLE) {
    score.score = 50
  }
  return score
}

const balanceFor = function (user) {
  const balance = { player: user, balances: {} }
  return balance
}

gameSchema.post('save', function (doc) {
  doc.players.forEach((player) => {
    doc.balances.push(balanceFor.bind(doc)(player))
    doc.scoreboard.push(scoreFor.bind(doc)(player))
  })
})

gameSchema.methods.addPlayer = function (user) {
  if (this.status !== GameStatus.ACTIVE) {
    this.players.push(user)
    this.scoreboard.push(scoreFor.bind(this)(user))
  }
}

module.exports = mongoose.model('Game', gameSchema)
