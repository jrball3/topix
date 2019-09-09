const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameType = require('../../models/game-type')
const UserModel = require('../../models/user')
const GameModel = require('../../models/game')
const GameFactory = require('../../factories/game')

/**
 * @swagger
 * 
 * /api/v1/game:
 *   get:
 *     description: Fetch all games for the player
 *     produces:
 *       - application/json
 *   post:
 *     description: Create a game
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: The name of the game.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: type
 *         description: The type of the game.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: players
 *         description: The players in the game.
 *         in: formData
 *         required: true
 *         type: array
 *       - components:
 *         - securitySchemes:
 *           - bearerAuth:
 *             type: http
 *             scheme: bearer
 *             bearerFormat: JWT  # optional, for documentation purposes only
 *       - security:
 *         - bearerAuth: []
 * 
 * /api/v1/game/{gameId}:
 *   get:
 *     description: Fetch a game
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: gameId
 *         description: The ID of the game.
 *         in: path
 *         required: true
 *         type: string
*/

class V1GameApi {

  applyGet (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
    })

    app.get('/api/v1/game/:gameId', validator(schema), async (req, res, next) => {
      try {
        const { gameId } = req.params
        const game = await GameModel.findById(gameId)
        res.send({ game })
      } catch (err) {
        res.send(errors.InternalServerError(err))
      }
      return next()
    })
  }

  applyIndex (app) {
    app.get('/api/v1/game', async (req, res, next) => {
      const { user } = req;
      try {
        const populated = await user.populate('games').execPopulate();
        res.send({ games: populated.games })
      } catch (err) {
        res.send(errors.InternalServerError(err))
      }
      return next()
    })
  }

  applyPost (app) {
    const schema = Joi.object().keys({
      name: Joi.string().required(),
      players: Joi.array().items(Joi.string()),
      type: Joi.string().valid(Object.values(GameType)).required()
    })

    app.post('/api/v1/game', validator(schema), async (req, res, next) => {
      try {
        const { user } = req
        const { name, type } = req.body
        const notFound = []
        const playerErrors = []
        const players = [user]
        const usernames = (req.body.players || [])

        await Promise.all(usernames.map(function (un) {
          return UserModel.findOne({ username: un })
            .then(function (doc) {
              if (doc) players.push(doc)
              else notFound.push(un)
            })
            .catch(function (err) {
              console.error(err)
              playerErrors.push(err)
            })
        }))

        const { game, scores } = await GameFactory.gameFor(name, type, players)
        await Promise.all(players.map(p => p.save()))
        await Promise.all(scores.map(s => s.save()))
        game.scores.push(...scores)
        await game.save()
        const retGame = await GameModel
          .findById(game._id)
          .populate('players')
          .populate('posts')
          .populate({
            path: 'posts',
            populate: { path: 'upvotes' }
          })
          .populate({
            path: 'posts',
            populate: { path: 'downvotes' }
          })
          .populate('scores')
          .populate({
            path: 'scores',
            // Get friends of friends - populate the 'friends' array for every friend
            populate: { path: 'player' }
          })
          .exec();

        res.send({
          game: retGame,
          errors: { players: { notFound, errors: playerErrors } }
        })
      } catch (err) {
        console.error(err)
        res.send(new errors.InternalServerError(err))
      }

      return next()
    })

  }

  apply (app) {
    this.applyGet(app)
    this.applyIndex(app)
    this.applyPost(app)
  }
}

module.exports = { V1GameApi }
