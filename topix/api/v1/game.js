const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameType = require('../../models/game-type')
const UserModel = require('../../models/user')
const GameModel = require('../../models/game')
const GameFactory = require('../../factories/game')

class V1GameApi {
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
        game.scores.push(...scores)
        await game.save()
        res.send({
          game: await GameModel.findOne({'_id': game._id}),
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
    this.applyPost(app)
  }
}

module.exports = { V1GameApi }
