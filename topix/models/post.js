const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  message: {
    type: String,
    required: true
  }
})

postSchema.plugin(timestamp)

module.exports = mongoose.model('Post', postSchema)
