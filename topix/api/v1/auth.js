const rjwt = require('restify-jwt-community')
const jwt = require('jsonwebtoken')
const errors = require('restify-errors')
const UserModel = require('../../models/user')
const resolveUser = require('../../middleware/resolve-user')
const validator = require('../../middleware/validate')
const Joi = require('joi')

class V1AuthApi {
  constructor (unless) {
    this.unless = unless
  }

  applyPost (app) {
    // using restify-jwt to lock down everything except /auth
    app.use(rjwt({ secret: process.env.JWT_SECRET }).unless(this.unless))
    app.use(resolveUser())

    const schema = Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    })

    app.post('/api/v1/auth', validator(schema), async (req, res, next) => {
      const { username, password } = req.body
      const user = await UserModel.findOne({ username })
      if (!user) {
        res.send(new errors.UnauthorizedError(
          'Invalid username or password.'
        ))
        return next()
      }
      const success = await user.authenticate(password)
      if (!success) {
        res.send(new errors.UnauthorizedError(
          'Invalid username or password.'
        ))
        return next()
      }
      // creating jsonwebtoken using the secret from config
      const token = jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      // retrieve issue and expiration times
      const { iat, exp } = jwt.decode(token)
      res.send({ 'createdAt': iat, 'expiresAt': exp, token })
      return next()
    })
  }

  apply (app) {
    this.applyPost(app)
  }
}

module.exports = { V1AuthApi }
