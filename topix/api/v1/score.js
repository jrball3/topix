const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const ScoreModel = require('../../models/score')

class V1ScoreApi {

  applyGet (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
      scoreId: Joi.string().optional(),
    })

    app.get('/api/v1/score', validator(schema, 'query'), async (req, res, next) => {
      const { gameId, scoreId } = req.query
      try {
        let scores;
        if (scoreId) {
          scores = [await ScoreModel
            .findById(scoreId)
            .populate('player')]
        } else {
          scores = await ScoreModel
            .find({ 'game': gameId })
            .populate('player')
        }
        res.send({ scores })
      } catch (err) {
        res.send(errors.InternalServerError(err))
      }
      return next()
    })
  }

  apply (app) {
    this.applyGet(app)
  }
}

module.exports = { V1ScoreApi }
