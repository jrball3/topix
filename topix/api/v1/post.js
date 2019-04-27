const errors = require('restify-errors')
const validator = require('../../middleware/validate')
const Joi = require('joi')
const GameModel = require('../../models/game')
const StrategyFactory = require('../../mechanics/strategies')
const mongoose = require('mongoose')

class V1PostApi {
  applyPost (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
      message: Joi.string().required(),
    })

    app.post('/api/v1/post', validator(schema), (req, res, next) => {
      const { user } = req
      const { gameId, message } = req.body
      GameModel.findById(gameId)
        .then(function(game) {
          if (!game) {
            res.send(new errors.ResourceNotFoundError(`Game ${gameId} not found`))
            return next()
          }
          StrategyFactory
            .strategyFor(game)
            .createPost(user, message)
            .then(post => {
              res.send(post)
              return next()
            })
            .catch(err => {
              res.send(errors.InternalServerError(err))
              return next()
            })
      })
      .catch(err => {
        console.error(err)
        res.send(new errors.InternalServerError(err))
        return next()
      })
    })
  }

  applyUpvote (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
      message: Joi.string().required(),
    })

    app.post('/api/v1/upvote', validator(schema), (req, res, next) => {
      const { user } = req
      const { gameId, postId } = req.body
      Promise.all([
        GameModel.findById(gameId),
        PostModel.findById(postId)
      ])
      .then(function([game, post]) {
        if (!game) {
          res.send(new errors.ResourceNotFoundError(`Game ${gameId} not found!`))
          return next()
        }
        if (!post) {
          res.send(new errors.ResourceNotFoundError(`Post ${postId} not found!`))
          return next()
        }
        return StrategyFactory
          .strategyFor(game)
          .upvotePost(user, post)
      })
      .then(() => {
        res.send(post)
        return next()
      })
      .catch((err) => {
        console.log(err)
        res.send(new errors.InternalServerError(err))
        return next()
      })
    })
  }

  applyDownvote (app) {
    const schema = Joi.object().keys({
      gameId: Joi.string().required(),
      message: Joi.string().required(),
    })

    app.post('/api/v1/downvote', validator(schema), (req, res, next) => {
      const { user } = req
      const { gameId, postId } = req.body
      Promise.all([
        GameModel.findOne({ id: gameId }),
        PostModel.findOne({ id: postId })
      ])
      .then(function([game, post]) {
        if (!game) {
          res.send(new errors.ResourceNotFoundError(`Game ${gameId} not found!`))
          return next()
        }
        if (!post) {
          res.send(new errors.ResourceNotFoundError(`Post ${postId} not found!`))
          return next()
        }
        return StrategyFactory
          .strategyFor(game)
          .downvotePost(user, post)
      })
      .then(() => {
        res.send(post)
        return next()
      })
      .catch((err) => {
        console.log(err)
        res.send(new errors.InternalServerError(err))
        return next()
      })
    })
  }

  apply (app) {
    this.applyPost(app)
    this.applyUpvote(app)
    this.applyDownvote(app)
  }
}

module.exports = { V1PostApi }
