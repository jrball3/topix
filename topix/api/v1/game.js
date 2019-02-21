const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameModel = require('../../models/game')
const GameType = require('../../models/game-type')
const UserModel = require('../../models/user')

class V1GameApi {
  apply (app) {
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      usernames: Joi.array().items(Joi.string()),
      type: Joi.string().valid(Object.values(GameType)).required()
    })

    app.post('/api/v1/game', validator(schema), (req, res, next) => {
      const { user } = req
      const { name, type } = req.body

      const players = []
      const invalid = []
      const usernames = req.body.usernames || []

      usernames.forEach((un) => {
        UserModel.findOne({ username: un }).then((doc) => {
          if (doc) players.push(doc)
          else invalid.push(un)
        })
      })

      const game = new GameModel({
        name,
        type,
        players: [user, ...players]
      })

      game.save()
        .then(doc => {
          res.send({
            game: doc,
            invalid
          })
          return next()
        })
        .catch(err => {
          console.error(err)
          res.send(new errors.InternalServerError(err))
          return next()
        })
    })
  }
}

module.exports = { V1GameApi }
