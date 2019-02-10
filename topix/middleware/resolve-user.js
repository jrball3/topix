const errors = require('restify-errors')
const UserModel = require('../models/user')

module.exports = function () {
  return function (req, res, next) {
    if (!req.user) return next()
    UserModel
      .findOne({ username: req.user.username })
      .then((doc) => {
        if (!doc) {
          res.send(new errors.UnprocessableEntityError('User not found.'))
        } else {
          req.user = doc
          return next()
        }
      })
      .catch((err) => {
        console.error(err)
        res.send(new errors.InternalServerError('An error occured while resolving user identity.'))
      })
  }
}
