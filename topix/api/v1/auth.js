const rjwt = require('restify-jwt-community')
const jwt = require('jsonwebtoken')
const errors = require('restify-errors')
const UserModel = require('../../models/user')

class V1AuthApi {
  constructor (exclusions) {
    this.exclusions = exclusions || []
  }

  apply (app) {
    // using restify-jwt to lock down everything except /auth
    app.use(rjwt({ secret: process.env.JWT_SECRET }).unless({
      path: this.exclusions
    }))

    app.post('/api/v1/auth', (req, res, next) => {
      const { username, password } = req.body
      UserModel
        .find({ username })
        .then(doc => {
          const user = doc[0]
          if (!user) {
            res.send(new errors.UnauthorizedError('Invalid username or password.'))
            return next()
          }
          return user.authenticate(password)
        })
        .then(success => {
          if (!success) {
            res.send(new errors.UnauthorizedError('Invalid username or password.'))
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
        .catch(err => {
          res.send(new errors.InternalServerError(err))
          return next()
        })
    })
  }
}

module.exports = { V1AuthApi }
