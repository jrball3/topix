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
  fetchScores,
} = require('./helpers')
const { _ } = require('lodash')


const GameType = require('../models/game-type')

const url = 'http://localhost:3000'

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('karma hole', function () {
      let response, token, game
      let user = mockUserDetails()
      const players = [
        mockUserDetails(), 
        mockUserDetails(),
        mockUserDetails(),
      ]
      const playerTokens = [null, null, null]

      before(async function () {
        this.timeout(5000)
        const regUser = await registerUser(user)
        user.id = regUser.body.user.id
        const auth = await authUser(user)
        token = auth.body.token
        await Promise.all(players.map((player, idx) => 
          registerUser(player)
          .then( function (res) {
            players[idx].id = res.body.user.id
          })
          .then(() => authUser(player))
          .then( function (res) {
            playerTokens[idx] = res.body.token
          })
        ))
      })

      before(async function () {
        this.timeout(5000)
        const res = await createGame(
          token,
          'testGame',
          GameType.KARMA_HOLE,
          players,
        )
        game = res.body.game
      })

      it('should properly handle a post', async function () {
        this.timeout(5000)
        const postRes = await createPost(token, game.id, 'this is my message')
        response = postRes
        expect(postRes).to.have.status(200)
        expect(postRes.body.post).to.have.property('upvotes')
        expect(postRes.body.post).to.have.property('downvotes')
        expect(postRes.body.post.message).to.be.equal('this is my message')
        expect(postRes.body.post.game.players.length).to.be.equal(4)
        const scoreRes = await fetchScores(token, game.id)
        response = scoreRes
        expect(scoreRes).to.have.status(200)
        expect(scoreRes.body.scores.filter(s => s.player.username === user.username)[0].score).to.be.equal(45)
      })

      it('should properly reject a post with too low of a score', async function () {
        this.timeout(5000)
        await Promise.all(_.range(10).map(async () => {
          const postRes = await createPost(playerTokens[0], game.id, 'this is my message')
          response = postRes
          expect(postRes).to.have.status(200)
        }))
        const postRes = await createPost(playerTokens[0], game.id, 'this is my message')
        response = postRes
        expect(postRes).to.have.status(422)
      })

      it('should properly handle an upvote', async function () {
        this.timeout(5000)
        const postRes = await createPost(playerTokens[1], game.id, 'this is my message')
        response = postRes
        expect(postRes).to.have.status(200)
        const postId = postRes.body.post.id
        const res = await chai.request(url)
          .post(`/api/v1/post/${postId}/upvote`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${playerTokens[2]}`)
          .send()
        response = res
        expect(res).to.have.status(200)
        expect(res.body.upvote.post).to.be.equal(postId)
        expect(res.body.upvote.user).to.be.equal(players[2].id)
        const scoreRes = await fetchScores(token, game.id)
        expect(scoreRes.status).to.be.equal(200)
        expect(scoreRes.body.scores.filter(s => s.player.username === players[1].username)[0].score).to.be.equal(55)
        expect(scoreRes.body.scores.filter(s => s.player.username === players[2].username)[0].score).to.be.equal(55)
      })

      it('should properly reject a self upvote', async function () {
        this.timeout(5000)
        const postRes = await createPost(token, game.id, 'this is my message')
        response = postRes
        expect(postRes).to.have.status(200)
        const postId = postRes.body.post.id
        const res = await chai.request(url)
          .post(`/api/v1/post/${postId}/upvote`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${token}`)
          .send()
        response = res
        expect(res).to.have.status(401)
      })

      it('should properly handle an downvote', async function () {
        this.timeout(5000)
        const postRes = await createPost(playerTokens[1], game.id, 'this is my message')
        response = postRes
        expect(postRes).to.have.status(200)
        const postId = postRes.body.post.id
        const res = await chai.request(url)
          .post(`/api/v1/post/${postId}/downvote`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${playerTokens[2]}`)
          .send()
        response = res
        expect(res).to.have.status(200)
        expect(res.body.downvote.post).to.be.equal(postId)
        expect(res.body.downvote.user).to.be.equal(players[2].id)
        const scoreRes = await fetchScores(token, game.id)
        expect(scoreRes.status).to.be.equal(200)
        expect(scoreRes.body.scores.filter(s => s.player.username === players[1].username)[0].score).to.be.equal(40)
        expect(scoreRes.body.scores.filter(s => s.player.username === players[2].username)[0].score).to.be.equal(50)
      })

      it('should properly reject a self downvote', async function () {
        this.timeout(5000)
        const postRes = await createPost(token, game.id, 'this is my message')
        response = postRes
        expect(postRes).to.have.status(200)
        const postId = postRes.body.post.id
        const res = await chai.request(url)
          .post(`/api/v1/post/${postId}/downvote`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${token}`)
          .send()
        response = res
        expect(res).to.have.status(401)
      })

      afterEach(function () {
        if (this.currentTest.state === 'failed') {
          console.log('    Response body: ' + util.inspect(response.body, { depth: null, colors: true }) + '\n')
        }
      })
    })
  })
})
