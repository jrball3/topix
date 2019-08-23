const PostModel = require('../models/post')
const GameModel = require('../models/game')
const ScoreModel = require('../models/score')

const POST_COST = -5
const DOWNVOTE_COST = -5
const DOWNVOTE_AWARD = -10
const UPVOTE_COST = 5
const UPVOTE_AWARD = 10

const KarmaHole = (game) => ({
  createPost: async function (player, message) {
    const post = PostModel({
      user: player,
      game,
      message,
    })
    const score = await ScoreModel.findOne({ 
      'game': game._id, 
      'player': player._id
    })
    score.score += POST_COST
    await Promise.all([score.save(), post.save()])
    return post
  },

  upvotePost: async function (player, post) {
    await Promise.all([
      async () => {
        const score = await ScoreModel.findOne({ 
          'game': game._id, 
          'player': player._id
        })
        score.score += UPVOTE_COST
        await score.save()
      },
      async () => {
        const score = await ScoreModel.findOne({ 
          'game': game._id, 
          'player': player._id
        })
        score.score += UPVOTE_AWARD
        await score.save()
      },
    ])
    return game
  },

  downvotePost: async function (user, post) {
    await Promise.all([
      async () => {
        const score = await ScoreModel.findOne({ 
          'game': game._id, 
          'player': player._id
        })
        score.score += DOWNVOTE_COST
        await score.save()
      },
      async () => {
        const score = await ScoreModel.findOne({ 
          'game': game._id, 
          'player': player._id
        })
        score.score += DOWNVOTE_AWARD
        await score.save()
      },
    ])
    return game
  },
})

module.exports = KarmaHole