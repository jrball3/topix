const errors = require('restify-errors')
const Joi = require('joi')

module.exports = function (schema) {
  return function (req, res, next) {
    Joi.validate(req.body, schema, (err, value) => {
      if (err) {
        res.send(new errors.BadRequestError(err))
      } else {
        return next()
      }
    })
  }
}
