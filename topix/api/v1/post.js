const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameModel = require('../../models/game')
const PostModel = require('../../models/post')
const StrategyFactory = require('../../mechanics/strategies')
const Redlock = require('../../redlock-client')

/**
 * @swagger
 *
 * /api/v1/post/{postId}:
 *   get:
 *     description: Fetch the state of a post
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: postId
 *         description: The ID of the post.
 *         in: path
 *         required: true
 *         type: string
 * 
 * /api/v1/post:
 *   get:
 *     description: Fetch all posts for a game
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: gameId
 *         description: The ID of the game.
 *         in: formData
 *         required: true
 *         type: string
 *   post:
 *     description: Create a post in a game
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: gameId
 *         description: The ID of the game.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: message
 *         description: The content of the message.
 *         in: formData
 *         required: true
 *         type: string
 * 
  * /api/v1/upvote:
 *   get:
 *     description: Upvote a post
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: postId
 *         description: The ID of the post.
 *         in: formData
 *         required: true
 *         type: string
 * 
 * /api/v1/downvote:
 *   get:
 *     description: Downvote a post
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: postId
 *         description: The ID of the post.
 *         in: formData
 *         required: true
 *         type: string
*/

async function lockScore(user, game) {
  const ttl = 1000;
  const resource = `locks:score:user[${user.id}]:game[${game.id}]`;
  return await Redlock.lock(resource, ttl)
}

class V1PostApi {
  applyGet (app) {
    const schema = Joi.object().keys({
      postId: Joi.string().required(),
    })

    app.get('/api/v1/post/:postId', validator(schema, 'params'), async (req, res, next) => {
      try {
        const { postId } = req.params
        const post = await PostModel.findById(postId)
        res.send({ post })
      }
      catch (err) {
        console.error(err)
        res.send(new errors.InternalServerError(err)) 
      }
      return next()
    })
  }

  applyIndex (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
    })

    app.get('/api/v1/post', validator(schema), async (req, res, next) => {
      try {
        const { gameId } = req.query
        const game = await GameModel.findById(gameId)
        if (!game) {
          res.send(new errors.ResourceNotFoundError(`Game ${gameId} not found`))
          return next()
        }
        const posts = await PostModel.find({ game: gameId })
        res.send({ posts })
      }
      catch (err) {
        console.error(err)
        res.send(new errors.InternalServerError(err)) 
      }
      return next()
    })
  }

  applyPost (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
      message: Joi.string().required(),
    })

    app.post('/api/v1/post', validator(schema), async (req, res, next) => {
      try {
        const { user } = req
        const { gameId, message } = req.body
        const game = await GameModel.findById(gameId)
        if (!game) {
          res.send(new errors.ResourceNotFoundError(`Game ${gameId} not found`))
          return next()
        }

        const lock = await lockScore(user, game)
        try {
          const strategy = StrategyFactory.strategyFor(game)
          const canDo = await strategy.canCreatePost(user)
          if (canDo) {
            const post = await strategy.createPost(user, message)
            const savedPost = await post.save()
            res.send({ post: savedPost })
          }
          else {
            res.send(new errors.UnprocessableEntityError(
              `You need at least a score of ${Math.abs(strategy.POST_COST)} to post.`
            ))
          }
        } finally {
          lock.unlock().catch((err) => console.log(err))
        }
      }
      catch (err) {
        console.error(err)
        res.send(new errors.InternalServerError(err)) 
      }
      return next()
    })
  }

  applyUpvote (app) {
    const schema = Joi.object().keys({
      postId: Joi.string().required(),
    })

    app.post('/api/v1/post/:postId/upvote', validator(schema), async (req, res, next) => {
      try {
        const { user } = req
        const { postId } = req.params
        const post = await PostModel
          .findById(postId)
          .populate('game')
          .populate('author')
          .exec();

        if (!post) {
          res.send(new errors.ResourceNotFoundError(`Post ${postId} not found!`))
          return next()
        }

        if (post.author.id == user.id) {
          res.send(new errors.UnauthorizedError('Users cannot upvote their own posts.'))
          return next()
        }

        const lock = await lockScore(user, post.game)
        try {
          const strategy = StrategyFactory.strategyFor(post.game)
          const canDo = await strategy.canUpvotePost(user)
          if (canDo) {
            const upvote = await strategy.upvotePost(user, post)
            res.send({ upvote })
          } else {
            res.send(errors.UnprocessableEntityError(
              `You need at least a score of ${strategy.POST_COST} to upvote.`
            ))
          }
        } finally {
          lock.unlock().catch((err) => console.log(err))
        }

        return next()
      }
      catch (err) {
        console.log(err)
        res.send(new errors.InternalServerError(err))
        return next()
      }
    })
  }

  applyDownvote (app) {
    const schema = Joi.object().keys({
      postId: Joi.string().required(),
    })

    app.post('/api/v1/post/:postId/downvote', validator(schema), async (req, res, next) => {
      try {
        const { user } = req
        const { postId } = req.params
        const post = await PostModel
          .findById(postId)
          .populate('game')
          .populate('author')
          .exec()

        if (!post) {
          res.send(new errors.ResourceNotFoundError(`Post ${postId} not found!`))
          return next()
        }

        if (post.author.id == user.id) {
          res.send(new errors.UnauthorizedError('Users cannot downvote their own posts.'))
          return next()
        }

        const lock = await lockScore(user, post.game)
        try {
          const strategy = StrategyFactory.strategyFor(post.game)
          const canDo = await strategy.canDownvotePost(user)
          if (canDo) {
            const downvote = await strategy.downvotePost(user, post)
            res.send({ downvote })
          } else {
            res.send(errors.UnprocessableEntityError(
              `You need at least a score of ${strategy.POST_COST} to downvote.`
            ))
          }
        } finally {
          lock.unlock().catch((err) => console.log(err))
        }

        return next()
      }
      catch (err) {
        console.log(err)
        res.send(new errors.InternalServerError(err))
        return next()
      }
    })
  }

  apply (app) {
    this.applyGet(app)
    this.applyIndex(app)
    this.applyPost(app)
    this.applyUpvote(app)
    this.applyDownvote(app)
  }
}

module.exports = { V1PostApi }
