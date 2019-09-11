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
        console.error(err)
        res.send(new errors.UnprocessableEntityError(err))
        return next()
      }
      res.send(doc)
      return next()
    })
  }

  async _createIfUnique (user, friend, res, next) {
    try{
      const fship = await UserModel.friendshipBetween(user, friend);
      if (fship) {
        console.log(fship)
        if (fship.status === 'accepted') {
          res.send(new errors.UnprocessableEntityError(
            'An accepted friendship with this user already exists.'
          ))
          return next()
        }
        if (fship.status === 'pending' || fship.status === 'requested') {
          res.send(new errors.UnprocessableEntityError(
            'A pending friendship with this user already exists.'
          ))
          return next()
        }
      }
    } catch (error) {
      res.send(new errors.InternalServerError(error))
      return next()
    }

    return this._createRequest(user, friend, res, next)
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
        return await this._createIfUnique(req.user, friend, res, next)
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
        UserModel.getAcceptedFriends(req.user, function (err, friendships) {
          if (err) {
            console.error(err)
            res.send(new errors.InternalServerError(err))
            return next()
          }
          res.send({ friendships })
          return next()
        })
      } catch (err) {
        res.send(errors.InternalServerError(err))
        return next()
      }
    })
  }

  applyGetPending (app) {
    app.get('/api/v1/friendship/pending', (req, res, next) => {
      try {
        UserModel.getPendingFriends(req.user, function (err, friendships) {
          if (err) {
            console.error(err)
            res.send(new errors.InternalServerError(err))
            return next()
          }
          res.send({ friendships })
          return next()
        })
      } catch (err) {
        res.send(errors.InternalServerError(err))
        return next()
      }
    })
  }

  applyAccept (app) {
    const schema = Joi.object().keys({
      friendshipId: Joi.string().required()
    })

    app.post('/api/v1/friendship/:friendshipId/accept', validator(schema, 'params'), async (req, res, next) => {
      try {
        const { user } = req;
        user.getPendingFriends({ '_id': req.params.friendshipId }, function(err, fships) {
          if (err) {
            console.error(err)
            res.send(new errors.InternalServerError(err))
            return next()
          }
          if (!fships || fships.length === 0) {
            res.send(new errors.BadRequestError('User does not have this pending friendship.'))
            return next()
          }
          if (fships[0].status !== 'pending') {
            res.send(new errors.BadRequestError('This friendship is not pending'))
            return next()
          }
          UserModel.requestFriend(user._id, req.params.friendshipId, function (err, fs) {
            if (err) {
              console.error(err)
              res.send(new errors.InternalServerError(err))
              return next()
            }
            res.send({'friendship': fs})
            return next()
          });
        });
      }
      catch (err) {
        console.error(err)
        res.send(new errors.InternalServerError(err))
        return next()
      }
    })
  }

  applyReject (app) {
    const schema = Joi.object().keys({
      friendshipId: Joi.string().required()
    })

    app.post('/api/v1/friendship/:friendshipId/reject', validator(schema, 'params'), async (req, res, next) => {
      try {
        const { user } = req;
        await user.getFriends({ '_id': req.params.friendshipId }, function (err, fs) {
          if (err) {
            console.error(err)
            res.send(new errors.InternalServerError(err))
            return next()
          }
          if (!fs || fs.length === 0) {
            res.send(new errors.BadRequestError('User does not have this friendship.'))
            return next()
          }
          UserModel.removeFriend(user._id, req.params.friendshipId, function (err, fs) {
            if (err) {
              console.error(err)
              res.send(new errors.InternalServerError(err))
              return next()
            }
            res.send({'friendship': fs})
            return next();
          });
        })
      }
      catch (err) {
        console.error(err)
        res.send(new errors.InternalServerError(err))
        return next()
      }
    })
  }

  apply (app) {
    this.applyGet(app)
    this.applyGetPending(app)
    this.applyPost(app)
    this.applyAccept(app);
    this.applyReject(app);
  }
}

module.exports = { V1FriendshipApi }
