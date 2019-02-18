const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameModel = require('../../models/game')
const UserModel = require('../../models/user')

class V1GameApi {
  apply (app) {
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      usernames: Joi.array().items(Joi.string())
    })

    app.post('/api/v1/game', validator(schema), (req, res, next) => {
      const { user } = req
      const { name, gameType, usernames } = req.body

      const playerIds = []
      const invalid = []
      usernames.forEach((un) => {
        UserModel.findOne({ username: un }).then((doc) => {
          if (doc) playerIds.push(doc._id)
          else invalid.push(un)
        })
      })

      const game = new GameModel({
        name,
        gameType,
        users: [user._id, ...playerIds]
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
