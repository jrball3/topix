const errors = require('restify-errors')
const UserModel = require('../../models/user')
const passwords = require('../../utilities/passwords')

export class V1RegisterApi {
  apply (app) {
    // using the `req.user` object provided by restify-jwt
    app.post('/api/v1/register', (req, res, next) => {
      const {
        firstName,
        lastName,
        username,
        displayName,
        email,
        password
      } = req.params

      passwords.hash(password)
        .then((hashedPassword) => {
          const user = new UserModel({
            firstName,
            lastName,
            username,
            displayName,
            email,
            password_hash: hashedPassword
          })
          user.save()
            .then(doc => {
              res.send(doc)
              next()
            })
            .catch(err => {
              console.error(err)
              res.send(new errors.BadRequestError(err))
              next()
            })
        })
        .catch((err) => {
          res.send(new errors.InternalServerError(err))
          next()
        })
    })
  }
}

export default V1RegisterApi
