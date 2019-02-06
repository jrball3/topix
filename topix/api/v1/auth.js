const rjwt = require('restify-jwt-community')
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
        .then(data => {
          // creating jsonwebtoken using the secret from config
          let token = rjwt.sign(data, process.env.JWT_SECRET, {
            expiresIn: '30d'
          })

          // retrieve issue and expiration times
          let { iat, exp } = rjwt.decode(token)
          res.send({ iat, exp, token })
          next()
        })
        .catch(err => {
          res.send(new errors.BadRequestError(err))
          next()
        })
    })
  }
}

export default V1AuthApi
