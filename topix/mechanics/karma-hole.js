const PostModel = require('../models/post')

const POST_COST = -5
const DOWNVOTE_COST = -5
const DOWNVOTE_AWARD = -10
const UPVOTE_COST = 5
const UPVOTE_AWARD = 10

const KarmaHole = (game) => ({
  createPost: async function (user, message) {
    const post = PostModel({
      user,
      game,
      message,
    })
    await post.save()
    await game.augmentPlayerScore(user, POST_COST)
    await game.scoreboard.save()
    await game.save()
    return post
  },

  upvotePost: async function (user, post) {
    await Promise.all([
      game.augmentPlayerScore(user, UPVOTE_COST),
      game.augmentPlayerScore(post.user, UPVOTE_AWARD)
    ]);
    await game.scoreboard.save()
    await game.save()
    return game;
  },

  downvotePost: async function (user, post) {
    await Promise.all([
      game.augmentPlayerScore(user, DOWNVOTE_COST),
      game.augmentPlayerScore(post.user, DOWNVOTE_AWARD)
    ]);
    await game.scoreboard.save()
    await game.save()
    return game;
  },
})

module.exports = KarmaHole