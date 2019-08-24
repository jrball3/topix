const PostModel = require('../models/post')
const ScoreModel = require('../models/score')
const UpvoteModel = require('../models/upvote')
const DownvoteModel = require('../models/downvote')

const KarmaHole = (game) => ({
  POST_COST: 5,
  DOWNVOTE_COST: 5,
  DOWNVOTE_AWARD: 10,
  UPVOTE_COST: 5,
  UPVOTE_AWARD: 10,

  canCreatePost: async function (player) {
    const score = await ScoreModel.findOne({ 
      'game': game._id, 
      'player': player._id
    })
    return score.score >= this.POST_COST
  },
  
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
    score.score -= this.POST_COST
    await Promise.all([score.save(), post.save()])
    return post
  },

  canUpvotePost: async function (player) {
    return true
  },

  upvotePost: async function (player, post) {
    const playerScore = await ScoreModel.findOne({ 
      'game': game._id, 
      'player': player._id
    })
    playerScore.score -= this.UPVOTE_COST
    playerScore.save()

    const authorScore = await ScoreModel.findOne({ 
      'game': game._id, 
      'player': post.author._id
    })
    authorScore.score += this.UPVOTE_AWARD
    authorScore.save()

    const upvote = new UpvoteModel({
      post: post._id,
      user: player._id
    })
    const savedUpvote = await upvote.save();
    
    return savedUpvote
  },

  canDownvotePost: async function (player) {
    const score = await ScoreModel.findOne({ 
      'game': game._id, 
      'player': player._id
    })
    return score.score >= this.DOWNVOTE_COST
  },

  downvotePost: async function (player, post) {
    const playerScore = await ScoreModel.findOne({ 
      'game': game._id, 
      'player': player._id
    })
    playerScore.score -= this.DOWNVOTE_COST
    playerScore.save()

    const authorScore = await ScoreModel.findOne({ 
      'game': game._id, 
      'player': post.author._id
    })
    authorScore.score += this.DOWNVOTE_AWARD
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