const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const util = require('util')
const { 
  mockUserDetails,
  registerUser,
  authUser,
  createGame,
} = require('./helpers')
const GameType = require('../models/game-type')
const GameStatus = require('../models/game-status')

const url = 'http://localhost:3000'

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('game', function () {
      const user = mockUserDetails()
      const friend = mockUserDetails()
      let response, token

      before(function (done) {
        registerUser(user)
        .then(function(res, err) {
          response = res
          if (err) throw err
          return authUser(user)
        })
        .then(function (res, err) {
          response = res
          if (err) throw err
          token = res.body.token
          return registerUser(friend)
        })
        .then(function (res, err) {
          response = res
          if (err) throw err
          done()
        })
      })

      it('should create a game with no players', function (done) {
        createGame(token, 'testGame', GameType.KARMA_HOLE, [])
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('game')
            expect(res.body.game.name).to.equal('testGame')
            expect(res.body.game.type).to.equal(GameType.KARMA_HOLE)
            expect(res.body.game.status).to.equal(GameStatus.PENDING)
            expect(res.body.errors.players.notFound.length).to.equal(0)
            expect(res.body.errors.players.errors.length).to.equal(0)
            expect(res.body.game.players.length).to.equal(1)
            expect(res.body.game.players[0].username).to.equal(user.username)
            expect(res.body.game.scores.length).to.equal(1)
            expect(res.body.game.scores[0].player.username).to.equal(user.username)
            expect(res.body.game.scores[0].score).to.equal(50)
            done()
          })
      })

      it('should create a game with players', function (done) {
        createGame(token, 'testGame', GameType.KARMA_HOLE, [friend])
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('game')
            expect(res.body.game.name).to.equal('testGame')
            expect(res.body.game.type).to.equal(GameType.KARMA_HOLE)
            expect(res.body.game.status).to.equal(GameStatus.PENDING)
            expect(res.body.errors.players.notFound.length).to.equal(0)
            expect(res.body.errors.players.errors.length).to.equal(0)
            expect(res.body.game.players.length).to.equal(2)
            expect(res.body.game.players[0].username).to.equal(user.username)
            expect(res.body.game.players[1].username).to.equal(friend.username)
            expect(res.body.game.scores.length).to.equal(2)
            expect(res.body.game.scores[0].player.username).to.equal(user.username)
            expect(res.body.game.scores[0].score).to.equal(50)
            expect(res.body.game.scores[1].player.username).to.equal(friend.username)
            expect(res.body.game.scores[1].score).to.equal(50)
            done()
          })
      })

      afterEach(function () {
        if (this.currentTest.state === 'failed') {
          console.log('    Response body: ' + util.inspect(response.body, { depth: null, colors: true }) + '\n')
        }
      })
    })
  })
})
