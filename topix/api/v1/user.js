const UserModel = require('../../models/user')
const errors = require('restify-errors')

class V1UserApi {
  apply (app) {
    app.get('/api/v1/user', (req, res, next) => {
      // The authorization header is automagically decoded by restifyjwt
      // and stored in the user attribute of the request.
      // The decoded token contains the username.
      console.log('got user fetch with req ' + req.user)
      UserModel
        .find({ username: req.user.username })
        .then(doc => {
          if (!doc) {
            res.send(errors.BadRequestError('Invalid authorization token.'))
          } else {
            const user = doc[0]
            res.send(user.toObject())
          }
          return next()
        })
        .catch(err => {
          res.send(errors.BadRequestError(err))
          return next()
        })
    })
  }
}

module.exports = { V1UserApi }
