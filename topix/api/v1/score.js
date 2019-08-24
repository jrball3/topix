const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const ScoreModel = require('../../models/score')

class V1ScoreApi {

  applyIndex (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
    })

    app.get('/api/v1/score', validator(schema), async (req, res, next) => {
      const { gameId } = req.query
      try {
        const scores = await ScoreModel
          .find({ 'game': gameId })
          .populate('player')
        res.send({ scores })
      } catch (err) {
        res.send(errors.InternalServerError(err))
      }
      return next()
    })
  }

  applyGet (app) {
    const schema = Joi.object().keys({
      scoreId: Joi.string().required(),
    })

    app.get('/api/v1/score/:scoreId', validator(schema, 'params'), async (req, res, next) => {
      const { scoreId } = req.params
      try {
        const score = await ScoreModel
          .findById({ scoreId })
          .populate('player')
        res.send({ score })
      } catch (err) {
        res.send(errors.InternalServerError(err))
      }
      return next()
    })
  }

  apply (app) {
    this.applyGet(app)
    this.applyIndex(app)
  }
}

module.exports = { V1ScoreApi }
