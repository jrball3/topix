const Joi = require('joi')
const validator = require('../../middleware/validate')
const UserModel = require('../../models/user')
const errors = require('restify-errors')

/**
 * @swagger
 *
 * /api/v1/friendship:
 *   post:
 *     description: Send a friend request
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: The username of the user to which to send a friend request.
 *         in: formData
 *         required: true
 *         type: string
*/

class V1FriendshipApi {
  _createRequest (user, friend, res, next) {
    UserModel.requestFriend(user._id, friend._id, function (err, doc) {
      if (err) {
        res.send(new errors.UnprocessableEntityError(err))
        return next()
      }
      res.send(doc)
      return next()
    })
  }

  _createIfUnique (user, friend, res, next) {
    UserModel.friendshipBetween(user, friend, function (err, doc) {
      if (err) {
        res.send(new errors.InternalServerError(err))
        return next()
      }
      if (doc) {
        console.log(doc)
        if (doc.status === 'accepted') {
          res.send(new errors.UnprocessableEntityError(
            'An accepted friendship with this user already exists.'
          ))
          return next()
        }
        if (doc.status === 'pending' || doc.status === 'requested') {
          res.send(new errors.UnprocessableEntityError(
            'A pending friendship with this user already exists.'
          ))
          return next()
        }
      }
      return this._createRequest(user, friend, res, next)
    }.bind(this))
  }

  applyPost (app) {
    const schema = Joi.object().keys({
      username: Joi.string().lowercase().required()
    })

    app.post('/api/v1/friendship', validator(schema), async (req, res, next) => {
      try {
        const friend = await UserModel.findOne({ username: req.body.username })
        if (!friend) {
          res.send(new errors.UnprocessableEntityError(
            `User with username "${req.body.username}" not found.`
          ))
          return next()
        }
        return this._createIfUnique(req.user, friend, res, next)
      }
      catch (err) {
        console.error(err)
        res.send(new errors.InternalServerError(err))
        return next()
      }
    })
  }

  applyGet (app) {
    app.get('/api/v1/friendship', (req, res, next) => {
      try {
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
      } catch (err) {
        res.send(errors.InternalServerError(err))
        return next()
      }
    })
  }

  apply (app) {
    this.applyGet(app)
    this.applyPost(app)
  }
}

module.exports = { V1FriendshipApi }
