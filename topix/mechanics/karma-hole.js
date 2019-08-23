const PostModel = require('../models/post')
const ScoreModel = require('../models/score')
const UpvoteModel = require('../models/upvote')
const DownvoteModel = require('../models/downvote')

const POST_COST = -5
const DOWNVOTE_COST = -5
const DOWNVOTE_AWARD = -10
const UPVOTE_COST = 5
const UPVOTE_AWARD = 10

const KarmaHole = (game) => ({
  createPost: async function (player, message) {
    const post = PostModel({
      author: player,
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

  // Why doesn't this await work? It does not block
  // and returns a promise....
  // upvotePost: async function (player, post) {
  //   const [,,upvote] = await Promise.all([
  //     async () => {
  //       const score = await ScoreModel.findOne({ 
  //         'game': game._id, 
  //         'player': player._id
  //       })
  //       score.score += UPVOTE_COST
  //       return await score.save()
  //     },
  //     async () => {
  //       const score = await ScoreModel.findOne({ 
  //         'game': game._id, 
  //         'player': player._id
  //       })
  //       score.score += UPVOTE_AWARD
  //       return await score.save()
  //     },
  //     async () => {
  //       const upvote = new UpvoteModel({
  //         post: post._id,
  //         user: player._id
  //       })
  //       return await upvote.save();
  //     }
  //   ])
  //   return upvote
  // },

    upvotePost: async function (player, post) {
      const playerScore = await ScoreModel.findOne({ 
        'game': game._id, 
        'player': player._id
      })
      playerScore.score += UPVOTE_COST
      playerScore.save()

      const authorScore = await ScoreModel.findOne({ 
        'game': game._id, 
        'player': post.author._id
      })
      authorScore.score += UPVOTE_AWARD
      authorScore.save()

      const upvote = new UpvoteModel({
        post: post._id,
        user: player._id
      })
      const savedUpvote = await upvote.save();
      
      return savedUpvote
    },

    downvotePost: async function (player, post) {
      const playerScore = await ScoreModel.findOne({ 
        'game': game._id, 
        'player': player._id
      })
      playerScore.score += DOWNVOTE_COST
      playerScore.save()

      const authorScore = await ScoreModel.findOne({ 
        'game': game._id, 
        'player': post.author._id
      })
      authorScore.score += DOWNVOTE_AWARD
      authorScore.save()

      const downvote = new DownvoteModel({
        post: post._id,
        user: player._id
      })
      const savedDownvote = await downvote.save();
      
      return savedDownvote
    },
})

module.exports = KarmaHole