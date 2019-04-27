const mongoose = require('mongoose')
const timestamp = require('./plugins/timestamp')
const GameType = require('./game-type')
const GameStatus = require('./game-status')

const scoreSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  }
})

scoreSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {   delete ret._id  }
});

scoreSchema.index({ 'player._id': 1 })
scoreSchema.index({ score: -1 })

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(GameStatus),
    default: GameStatus.PENDING
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(GameType)
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  scoreboard: [scoreSchema]
})

gameSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {   delete ret._id  }
});

gameSchema.plugin(timestamp)

const scoreFor = function (user) {
  const score = { player: user }
  if (this.type === GameType.KARMA_HOLE) {
    score.score = 50
  }
  return score
}

gameSchema.post('save', function (doc) {
  doc.players.forEach((player) => {
    doc.scoreboard.push(scoreFor.bind(doc)(player))
  })
})

gameSchema.methods.addPlayer = function (user) {
  if (this.status !== GameStatus.ACTIVE) {
    this.players.push(user)
    this.scoreboard.push(scoreFor.bind(this)(user))
  }
}

gameSchema.methods.augmentPlayerScore = async function (user, augmentation) {
  // Find score entry for player
  try {
    const scoreEntry = await this.scoreboard.findOne({ player: user })
    scoreEntry.score += augmentation
  } catch (err) {
    console.error(err)
    throw err
  }
}

gameSchema.methods.getLeaderboard = function () {
  try {
    return this.scoreboard.sort({ score: -1 })
  } catch (err) {
    console.error(err)
    throw err
  }
}

module.exports = mongoose.model('Game', gameSchema)
