const GameType = require('../models/game-type')
const GameModel = require('../models/game')
const ScoreModel = require('../models/score')

const ScoreFactory = {
  scoresFor: function(game) {
    let initialScore;
    switch (game.type) {
      case GameType.KARMA_HOLE:
        initialScore = 50;
        break;
      default:
        initialScore = 0
    }
    return game.players.map(p => 
      new ScoreModel({ game, player: p, score: initialScore }
    ))
  }
}

const GameFactory = {
  gameFor: async function(name, type, players) {
    const game = new GameModel({ game, name, type })
    players.forEach(player => {
      game.addPlayer(player);
      player.addGame(game);
    })
    const scores = ScoreFactory.scoresFor(game)
    return { game, scores };
  }
}

module.exports = GameFactory