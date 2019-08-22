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
} = require('./helpers')


const GameType = require('../models/game-type')
const GameStatus = require('../models/game-status')

const url = 'http://localhost:3000'

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('post', function () {
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
        .then(function(res, err) {
          response = res
          if (err) throw err
          done()
        })
      })

      before(function (done) {
        createGame(
          token,
          'testGame',
          GameType.KARMA_HOLE,
          players,
        )
        .then(function (res, err) {
          response = res
          game = res.body.game
          if (err) throw err
          done()
        })
      })

      it('should create a post', function (done) {
        createPost(token, game, 'this is my message')
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
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
