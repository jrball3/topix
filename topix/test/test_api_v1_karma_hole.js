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


const GameType = require('../models/game-type')

const url = 'http://localhost:3000'

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('karma hole', function () {
      let response, token, player1Token, game
      let user = mockUserDetails()
      const players = [
        mockUserDetails(), 
        mockUserDetails(),
        mockUserDetails(),
      ]

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
        ))
        const player1Auth = await authUser(players[0])
        player1Token = player1Auth.body.token
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

      it('should properly handle an upvote', async function () {
        this.timeout(5000)
        const postRes = await createPost(token, game.id, 'this is my message')
        response = postRes
        expect(postRes).to.have.status(200)
        const postId = postRes.body.post.id
        const res = await chai.request(url)
          .post(`/api/v1/post/${postId}/upvote`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${player1Token}`)
          .send()
        response = res
        expect(res).to.have.status(200)
        expect(res.body.upvote.post).to.be.equal(postId)
        expect(res.body.upvote.user).to.be.equal(players[0].id)
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
        const postRes = await createPost(token, game.id, 'this is my message')
        response = postRes
        expect(postRes).to.have.status(200)
        const postId = postRes.body.post.id
        const res = await chai.request(url)
          .post(`/api/v1/post/${postId}/downvote`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${player1Token}`)
          .send()
        response = res
        expect(res).to.have.status(200)
        expect(res.body.downvote.post).to.be.equal(postId)
        expect(res.body.downvote.user).to.be.equal(players[0].id)
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
