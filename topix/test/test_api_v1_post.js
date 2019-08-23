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
  fetchPost,
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

      before(async function () {
        this.timeout(5000)
        await registerUser(user)
        const auth = await authUser(user)
        token = auth.body.token
        await Promise.all(players.map(player => registerUser(player)))
      })

      before(async function () {
        const res = await createGame(
          token,
          'testGame',
          GameType.KARMA_HOLE,
          players,
        )
        game = res.body.game
      })

      it('should create a post', async function () {
        const res = await createPost(token, game.id, 'this is my message')
        response = res
        expect(res).to.have.status(200)
      })

      it('should fetch a post', async function () {
        await createPost(token, game.id, 'this is my message')
        const res = await fetchPost(token, game.id)
        response = res
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('posts')
        expect(res.body.posts.length).to.be.greaterThan(0)
      })

      afterEach(function () {
        if (this.currentTest.state === 'failed') {
          console.log('    Response body: ' + util.inspect(response.body, { depth: null, colors: true }) + '\n')
        }
      })
    })
  })
})
