const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const ScoreModel = require('../../models/score')

/**
 * @swagger
 *
 * /api/v1/score:
 *   get:
 *     description: Fetch a single score, or all scores
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: scoreId
 *         description: User's first name
 *         in: formData
 *         required: false
 *         type: string
 *       - name: gameId
 *         description: User's last name.
 *         in: formData
 *         required: false
 *         type: string
*/
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
            .populate('player')
            .exec()]
        } else {
          scores = await ScoreModel
            .find({ 'game': gameId })
            .populate('player')
            .exec()
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
