const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const util = require('util')
const { mockUserDetails, registerUser, authUser } = require('./helpers')
const GameType = require('../models/game-type')
const GameStatus = require('../models/game-status')

const url = 'http://localhost:3000'

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('auth', function () {
      const user = mockUserDetails()
      let response, token

      before(function (done) {
        registerUser(user, function (res) {
          response = res
          authUser(user, function (res) {
            response = res
            token = res.body.token
            done()
          })
        })
      })

      it('should create a game with no players', function (done) {
        chai.request(url)
          .post('/api/v1/game')
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'testGame',
            type: GameType.KARMA_HOLE
          })
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('game')
            expect(res.body.game.name).to.equal('testGame')
            expect(res.body.game.type).to.equal(GameType.KARMA_HOLE)
            expect(res.body.game.status).to.equal(GameStatus.PENDING)
            expect(res.body.game.players.length).to.equal(1)
            expect(res.body.game).to.have.property('balances')
            expect(res.body.game).to.have.property('posts')
            expect(res.body.game).to.have.property('scoreboard')
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
