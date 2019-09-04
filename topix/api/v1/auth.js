const rjwt = require('restify-jwt-community')
const jwt = require('jsonwebtoken')
const errors = require('restify-errors')
const UserModel = require('../../models/user')
const resolveUser = require('../../middleware/resolve-user')
const validator = require('../../middleware/validate')
const Joi = require('joi')

/**
 * @swagger
 *
 * /api/v1/auth:
 *   post:
 *     description: Authenticate a user session
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: The user's username for login purposes.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 * 
 * /api/v1/auth/check:
 *   post:
 *     description: Check an authentication token for validity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: The authentication token.
 *         in: formData
 *         required: true
 *         type: string
*/

class V1AuthApi {
  constructor ({ excludePaths }) {
    this.excludePaths = excludePaths
  }

  applyPost (app) {
    // using restify-jwt to lock down everything except /auth
    app.use(rjwt({ secret: process.env.JWT_SECRET }).unless(this.excludePaths))
    app.use(resolveUser())

    const schema = Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    })

    app.post('/api/v1/auth', validator(schema), async (req, res, next) => {
      try {
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
        res.send({ 
          'createdAt': iat,
          'expiresAt': exp,
          token 
        })
      } catch (err) {
        console.log(err)
        res.send(new errors.InternalServerError(err))
      }
      return next()
    })
  }

  applyCheck (app) {
    const schema = Joi.object().keys({
      token: Joi.string().required(),
    })

    app.post('/api/v1/auth/check', validator(schema), async (req, res, next) => {
      try {
        const { token } = req.body
        const decoded = jwt.decode(token)
        if (!decoded) {
          res.send(new errors.UnauthorizedError('Invalid token.'))
          return next()
        }
        const { username, iat, exp } = decoded;
        res.send({ 
          username,
          'createdAt': iat,
          'expiresAt': exp,
          token,
        })
      } catch (err) {
        console.log(err)
        res.send(new errors.InternalServerError(err))
      }
      return next()
    })
  }

  apply (app) {
    this.applyPost(app)
    this.applyCheck(app)
  }
}

module.exports = { V1AuthApi }
