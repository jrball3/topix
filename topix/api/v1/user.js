const errors = require('restify-errors')
const Joi = require('joi')
const validator = require('../../middleware/validate')
const UserModel = require('../../models/user')
const passwords = require('../../utilities/passwords')

class V1UserApi {
  applyPost (app) {
    const schema = Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      displayName: Joi.string(),
      username: Joi.string().lowercase().required(),
      password: Joi.string().required(),
      email: Joi.string().email().required()
    })

    app.post('/api/v1/user', validator(schema), async (req, res, next) => {
      const {
        firstName,
        lastName,
        username,
        displayName,
        email,
        password
      } = req.body

      let user, savedUser
      try {
        const hashedPassword = await passwords.hash(password)
        user = new UserModel({
          firstName,
          lastName,
          username,
          displayName,
          email,
          passwordHash: hashedPassword
        })
      } catch (err) {
        console.log(err)
        res.send(new errors.InternalServerError(err))
        return next()
      }

      try {
        savedUser = await user.save()
      } catch (err) {
        console.log(err)
        res.send(new errors.UnprocessableEntityError(err))
        return next()
      }

      res.send({ user: savedUser })
    })
  }

  applyGet (app) {
    app.get('/api/v1/user', (req, res, next) => {
      res.send({'user': req.user })
      return next()
    })
  }

  apply (app) {
    this.applyGet(app)
    this.applyPost(app)
  }
}

module.exports = { V1UserApi }
