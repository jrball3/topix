const errors = require('restify-errors')
const Joi = require('joi')
const validator = require('../../chains/validate')
const UserModel = require('../../models/user')
const passwords = require('../../utilities/passwords')
const jwt = require('restify-jwt')

class V1UserApi {
  applyPost (app) {
    const schema = Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      displayName: Joi.string(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string().required()
    })

    app.post('/api/v1/user', validator(schema), (req, res, next) => {
      const {
        firstName,
        lastName,
        username,
        displayName,
        email,
        password
      } = req.body
      passwords
        .hash(password)
        .then(hashedPassword => {
          return new UserModel({
            firstName,
            lastName,
            username,
            displayName,
            email,
            passwordHash: hashedPassword
          })
        })
        .catch(err => {
          console.error(err)
          res.send(new errors.InternalServerError(err))
          return next()
        })
        .then(userModel => userModel.save())
        .then(doc => {
          res.send(doc)
          return next()
        })
        .catch(err => {
          console.error(err)
          res.send(new errors.BadRequestError(err))
          return next()
        })
    })
  }

  applyGet (app) {
    app.get(
      '/api/v1/user',
      jwt({ secret: process.env.JWT_SECRET }),
      (req, res, next) => {
        UserModel
          .find({ username: req.user.username })
          .then(doc => {
            if (!doc) {
              res.send(new errors.BadRequestError('Invalid authorization token.'))
            } else {
              const user = doc[0]
              res.send(user.toObject())
            }
            return next()
          })
          .catch(err => {
            res.send(new errors.BadRequestError(err))
            return next()
          })
      })
  }

  apply (app) {
    this.applyGet(app)
    this.applyPost(app)
  }
}

module.exports = { V1UserApi }
