const PostModel = require('../models/post')
const GameModel = require('../models/game')

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
    // await game.augmentPlayerScore(player, POST_COST).save()
    await post.save()
    return post
  },

  upvotePost: async function (user, post) {
    // await Promise.all([
    //   game.augmentPlayerScore(user, UPVOTE_COST).save(),
    //   game.augmentPlayerScore(post.user, UPVOTE_AWARD).save(),
    // ]);
    return game
  },

  downvotePost: async function (user, post) {
    // await Promise.all([
    //   game.augmentPlayerScore(user, DOWNVOTE_COST).save(),
    //   game.augmentPlayerScore(post.user, DOWNVOTE_AWARD).save(),
    // ]);
    return game
  },
})

module.exports = KarmaHole