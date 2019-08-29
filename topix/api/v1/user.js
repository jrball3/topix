const errors = require('restify-errors')
const Joi = require('joi')
const validator = require('../../middleware/validate')
const UserModel = require('../../models/user')
const passwords = require('../../utilities/passwords')

/**
 * @swagger
 *
 * /api/v1/user:
 *   post:
 *     description: Create a user account
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: firstName
 *         description: User's first name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: lastName
 *         description: User's last name.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: username
 *         description: The user's username for login purposes.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: The user's e-mail address.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
*/

class V1UserApi {
  applyPost (app) {
    const schema = Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      username: Joi.string().lowercase().required(),
      password: Joi.string().required(),
      email: Joi.string().email().required()
    })

    app.post('/api/v1/user', validator(schema), async (req, res, next) => {
      const {
        firstName,
        lastName,
        username,
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
