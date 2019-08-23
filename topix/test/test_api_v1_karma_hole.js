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
  createPost,
  fetchGame,
  fetchScore,
} = require('./helpers')


const GameType = require('../models/game-type')

const url = 'http://localhost:3000'

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('karma hole', function () {
      let response, token, game
      const user = mockUserDetails()
      const players = [
        mockUserDetails(), 
        mockUserDetails(),
        mockUserDetails(),
      ]

      before(function (done) {
        this.timeout(5000)
        registerUser(user)
        .then(function(res, err) {
          response = res
          if (err) throw err
          return authUser(user)
        })
        .then(function (res, err) {
          response = res
          token = res.body.token
          if (err) throw err
          return Promise.all(players.map(player => registerUser(player)));
        })
        .then(function (res, err) {
          response = res
          if (err) throw err
          done()
        })
      })

      before(function (done) {
        this.timeout(5000)
        createGame(
          token,
          'testGame',
          GameType.KARMA_HOLE,
          players,
        )
        .end(function (err, res) {
          response = res
          if (err) throw err
          game = res.body.game
          done()
        })
      })

      it('should properly handle a post', function (done) {
        this.timeout(5000)
        createPost(token, game, 'this is my message')
          .then(function (res, err) {
            response = res
            if (err) throw err

            expect(res).to.have.status(200)
            expect(res.body).to.have.property('upvotes')
            expect(res.body).to.have.property('downvotes')
            expect(res.body.message).to.be.equal('this is my message')
            expect(res.body.game.players.length).to.be.equal(4)

            return fetchScore(token, game.id)
          })
          .then(function (res, err) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.score.filter(s => s.player.username === user.username)[0].score).to.be.equal(45)
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
