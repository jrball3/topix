const rjwt = require('restify-jwt-community')
const jwt = require('jsonwebtoken')
const auth = require('../../utilities/authenticate')
const errors = require('restify-errors')

export class V1AuthApi {
  constructor (exclusions) {
    this.exclusions = exclusions || []
  }

  apply (app) {
    // using restify-jwt to lock down everything except /auth
    app.use(rjwt({ secret: process.env.JWT_SECRET }).unless({
      path: this.exclusions
    }))

    app.post('/api/v1/auth', (req, res, next) => {
      const { username, password } = req.params
      auth.authenticate(username, password)
        .then(
          user => {
            if (!user) {
              res.send(new errors.UnauthorizedError())
              next()
              return
            }
            // creating jsonwebtoken using the secret from config
            const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
              expiresIn: '30d'
            })
            // retrieve issue and expiration times
            const { iat, exp } = jwt.decode(token)
            res.send({ iat, exp, token })
            next()
          },
          err => {
            console.log(err)
            res.send(new errors.BadRequestError(err))
            next()
          }
        )
        .catch(err => {
          console.log(err)
          res.send(new errors.InternalServerError(err))
          next()
        })
    })
  }
}

export default V1AuthApi
