const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameType = require('../../models/game-type')
const UserModel = require('../../models/user')
const GameModel = require('../../models/game')
const GameFactory = require('../../factories/game')

class V1GameApi {

  applyGet (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
    })

    app.get('/api/v1/game', validator(schema), async (req, res, next) => {
      const { gameId } = req.body
      try {
        const game = await GameModel.findById(gameId)
        res.send({ game })
      } catch (err) {
        res.send(errors.InternalServerError(err))
      }
      return next()
    })
  }

  applyPost (app) {
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      players: Joi.array().items(Joi.string()),
      type: Joi.string().valid(Object.values(GameType)).required()
    })

    app.post('/api/v1/game', validator(schema), async (req, res, next) => {
      const { user } = req
      const { name, type } = req.body
      const notFound = []
      const playerErrors = []
      const players = [user]
      const usernames = (req.body.players || [])

      await Promise.all(usernames.map(function (un) {
        return UserModel.findOne({ username: un })
          .then(function (doc) {
            if (doc) players.push(doc)
            else notFound.push(un)
          })
          .catch(function (err) {
            console.error(err)
            playerErrors.push(err)
          })
      }))

      try {
        const { game, scores } = await GameFactory.gameFor(name, type, players)
        await Promise.all(scores.map(s => s.save()))
        game.scores.push(...scores)
        await game.save()
        const retGame = await GameModel
          .findById(game._id)
          .populate('players')
          .populate({
            path: 'scores',
            // Get friends of friends - populate the 'friends' array for every friend
            populate: { path: 'player' }
          });

        res.send({
          game: retGame,
          errors: { players: { notFound, errors: playerErrors } }
        })
      } catch (err) {
        console.error(err)
        res.send(new errors.InternalServerError(err))
      }

      return next()
    })

  }

  apply (app) {
    this.applyGet(app)
    this.applyPost(app)
  }
}

module.exports = { V1GameApi }
