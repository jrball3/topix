const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')

const downvoteSchema = new mongoose.Schema({
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

downvoteSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {   delete ret._id  }
});

downvoteSchema.plugin(timestamp)

module.exports = mongoose.model('downvote', downvoteSchema)
