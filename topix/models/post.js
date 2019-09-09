const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upvote',
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Downvote',
  }],
  message: {
    type: String,
    required: true
  }
})

postSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {
    delete ret._id
    return ret
  }
});

postSchema.plugin(timestamp)

module.exports = mongoose.model('Post', postSchema)
