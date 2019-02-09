const errors = require('restify-errors')
const Joi = require('joi')
const validator = require('../../chains/validate')
const UserModel = require('../../models/user')
const passwords = require('../../utilities/passwords')

class V1RegisterApi {
  apply (app) {
    const schema = Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      displayName: Joi.string(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string().required()
    })

    app.post('/api/v1/register', validator(schema), (req, res, next) => {
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
}

module.exports = { V1RegisterApi }
