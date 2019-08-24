const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameModel = require('../../models/game')
const PostModel = require('../../models/post')
const StrategyFactory = require('../../mechanics/strategies')
const Redlock = require('../../redlock-client')

async function lockScore(user) {
  const ttl = 1000;
  const resource = `locks:score:${user.id}`;
  return await Redlock.lock(resource, ttl)
}

class V1PostApi {
  applyGet (app) {
    const schema = Joi.object().keys({
      postId: Joi.string().required(),
    })

    app.get('/api/v1/post/:postId', validator(schema, 'params'), async (req, res, next) => {
      const { postId } = req.params
      try {
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
      const { gameId } = req.query
      try {
        const game = await GameModel.findById(gameId)
        if (!game) {
          res.send(new errors.ResourceNotFoundError(`Game ${gameId} not found`))
          return next()
        }
        const posts = [await PostModel.find({ game: gameId })]
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
      const { user } = req
      const { gameId, message } = req.body
      try {
        const game = await GameModel.findById(gameId)
        if (!game) {
          res.send(new errors.ResourceNotFoundError(`Game ${gameId} not found`))
          return next()
        }

        const lock = await lockScore(user)
        const strategy = StrategyFactory.strategyFor(game)
        const canDo = await strategy.canCreatePost(user)
        if (canDo) {
          const post = await strategy.createPost(user, message)
          const savedPost = await post.save()
          lock.unlock().catch((err) => console.log(err))
          res.send({ post: savedPost })
        }
        else {
          lock.unlock().catch((err) => console.log(err))
          res.send(errors.UnprocessableEntityError(
            `You need at least a score of ${strategy.POST_COST} to post.`
          ))
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
      const { user } = req
      const { postId } = req.params
      try {
        const post = await PostModel
          .findById(postId)
          .populate('game')
          .populate('author')

        if (!post) {
          res.send(new errors.ResourceNotFoundError(`Post ${postId} not found!`))
          return next()
        }

        if (post.author.id == user.id) {
          res.send(new errors.UnauthorizedError('Users cannot upvote their own posts.'))
          return next()
        }

        const lock = await lockScore(user)
        const strategy = StrategyFactory.strategyFor(post.game)
        const canDo = await strategy.canUpvotePost(user)
        if (canDo) {
          const upvote = await strategy.upvotePost(user, post)
          lock.unlock().catch((err) => console.log(err))
          res.send({ upvote })
        } else {
          lock.unlock().catch((err) => console.log(err))
          res.send(errors.UnprocessableEntityError(
            `You need at least a score of ${strategy.POST_COST} to upvote.`
          ))
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
      const { user } = req
      const { postId } = req.params
      try {
        const post = await PostModel
          .findById(postId)
          .populate('game')
          .populate('author')

        if (!post) {
          res.send(new errors.ResourceNotFoundError(`Post ${postId} not found!`))
          return next()
        }

        if (post.author.id == user.id) {
          res.send(new errors.UnauthorizedError('Users cannot downvote their own posts.'))
          return next()
        }

        const lock = await lockScore(user)
        const strategy = StrategyFactory.strategyFor(post.game)
        const canDo = await strategy.canDownvotePost(user)
        if (canDo) {
          const downvote = await strategy.downvotePost(user, post)
          lock.unlock().catch((err) => console.log(err))
          res.send({ downvote })
        } else {
          lock.unlock().catch((err) => console.log(err))
          res.send(errors.UnprocessableEntityError(
            `You need at least a score of ${strategy.POST_COST} to downvote.`
          ))
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
