const Joi = require('joi')
const validator = require('../../middleware/validate')
const UserModel = require('../../models/user')
const errors = require('restify-errors')

class V1FriendshipApi {
  applyPost (app) {
    const schema = Joi.object().keys({
      username: Joi.string().lowercase().required()
    })

    app.post('/api/v1/friendship', validator(schema), (req, res, next) => {
      UserModel
        .findOne({ username: req.username })
        .then((friend) => {
          if (!friend) {
            res.send(new errors.UnprocessableEntityError(`User with username "${req.username}" not found.`))
            return next()
          }
          UserModel.requestFriend(req.user._id, friend._id, function (err, res) {
            if (err) {
              res.send(new errors.UnprocessableEntityError(err))
              return next()
            }
            res.send(res)
            return next()
          })
        })
        .catch((err) => {
          console.error(err)
          res.send(new errors.InternalServerError(err))
          return next()
        })
    })
  }

  applyGet (app) {
    app.get('/api/v1/friendship', (req, res, next) => {
      UserModel.getFriends(req.user, function (err, friendships) {
        // friendships looks like:
        // [{status: "pending", added: <Date added>, friend: user1}]
        if (err) {
          res.send(new errors.InternalServerError(err))
          return next()
        }
        res.send(friendships)
        return next()
      })
    })
  }

  apply (app) {
    this.applyGet(app)
    this.applyPost(app)
  }
}

module.exports = { V1FriendshipApi }
