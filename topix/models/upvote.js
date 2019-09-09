const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')

const upvoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
})

upvoteSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id
    return ret
  }
});

upvoteSchema.plugin(timestamp)

module.exports = mongoose.model('Upvote', upvoteSchema)
