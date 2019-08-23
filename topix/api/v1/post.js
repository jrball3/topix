const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameModel = require('../../models/game')
const PostModel = require('../../models/post')
const StrategyFactory = require('../../mechanics/strategies')

class V1PostApi {
  applyGet (app) {
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
        const posts = await PostModel.find({'game': gameId})
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
      const game = await GameModel.findById(gameId)
      if (!game) {
        res.send(new errors.ResourceNotFoundError(`Game ${gameId} not found`))
        return next()
      }
      try {
        const post = await StrategyFactory
          .strategyFor(game)
          .createPost(user, message)
        const savedPost = await post.save()
        res.send(savedPost)
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

    app.post('/api/v1/upvote', validator(schema), async (req, res, next) => {
      const { user } = req
      const { postId } = req.body
      try {
        const post = await PostModel.findById(postId).populate('game')
        if (!post) {
          res.send(new errors.ResourceNotFoundError(`Post ${postId} not found!`))
          return next()
        }

        const upvote = await StrategyFactory
          .strategyFor(post.game)
          .upvotePost(user, post)

        res.send({ upvote })
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

    app.post('/api/v1/downvote', validator(schema), async (req, res, next) => {
      const { user } = req
      const { postId } = req.body
      try {
        const post = await PostModel.findById(postId).populate('game')
        if (!post) {
          res.send(new errors.ResourceNotFoundError(`Post ${postId} not found!`))
          return next()
        }

        const downvote = await StrategyFactory
          .strategyFor(post.game)
          .downvotePost(user, post)

        res.send({ downvote })
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
    this.applyPost(app)
    this.applyUpvote(app)
    this.applyDownvote(app)
  }
}

module.exports = { V1PostApi }
