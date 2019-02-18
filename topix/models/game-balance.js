const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')
const GameType = require('./game-type')

const gameBalanceSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // call this.markModified('balances') whenver this changes.
  balances: {}
})

gameBalanceSchema.plugin(timestamp)

const GameBalance = mongoose.model('GameBalance', gameBalanceSchema)

gameBalanceSchema.statics.balanceFor = function (game, user) {
  const balance = new GameBalance({
    game: game._id,
    user: user._id
  })

  if (game.gameType === GameType.karmaHole) {
    balance.balances = { karma: 50 }
  }

  return balance
}

module.exports = GameBalance
