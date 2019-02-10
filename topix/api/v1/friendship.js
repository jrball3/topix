const Joi = require('joi')
const validator = require('../../chains/validate')
const UserModel = require('../../models/user')
const errors = require('restify-errors')

class V1FriendshipApi {
  applyPost (app) {
    const schema = Joi.object().keys({
      username: Joi.string().required()
    })

    app.post('/api/v1/friendship', validator(schema), (req, res, next) => {

    })
  }

  applyGet (app) {
    app.get('/api/v1/friendship', (req, res, next) => {

    })
  }

  apply (app) {
    this.applyGet(app)
    this.applyPost(app)
  }
}

module.exports = { V1FriendshipApi }
