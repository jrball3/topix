const GameType = require('../models/game-type')
const KarmaHole = require('./karma-hole')

const StrategyFactory = {
  strategyFor: function(game) {
    switch(game.type) {
      case GameType.KARMA_HOLE:
        return KarmaHole(game)
      default:
        throw Error(`Strategy not found for game of type ${game.type}!`)
    }
  }
}

module.exports = StrategyFactory