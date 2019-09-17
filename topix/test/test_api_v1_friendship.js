const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const util = require('util')
const { mockUserDetails, registerUser, authUser } = require('./helpers')

const url = 'http://localhost:3000'

/* global describe it step before afterEach */

describe('api', function () {
  let response

  describe('v1', function () {
    describe('friendship', function () {
      const user1 = mockUserDetails()
      const user2 = mockUserDetails()
      let user1Token, user2Token

      before(async function () {
        this.timeout(5000)
        const u1RegRes = await registerUser(user1)
        user1.id = u1RegRes.body.user.id
        const user1Auth = await authUser(user1)
        user1Token = user1Auth.body.token
        const u2RegRes = await registerUser(user2)
        user2.id = u2RegRes.body.user.id
        const user2Auth = await authUser(user2)
        user2Token = user2Auth.body.token
      })

      it('should return an error if the user does not exist', function (done) {
        chai.request(url)
          .post('/api/v1/friendship')
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ username: 'badname' })
          .end(function (err, res) {
            if (err) throw err
            expect(res).to.have.status(422)
            done()
          })
      })

      step('should create a friendship with a proper request', function (done) {
        chai.request(url)
          .post('/api/v1/friendship')
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ username: user2.username })
          .end(function (err, res) {
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.friend._id).to.not.be.equal(null)
            expect(res.body.friend.status).to.be.equal('pending')
            expect(res.body.friender).to.not.be.equal(null)
            expect(res.body.friender.status).to.be.equal('requested')
            done()
          })
      })

      step('should not create a friendship if one already exists', function (done) {
        chai.request(url)
          .post('/api/v1/friendship')
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ username: user2.username })
          .end(function (err, res) {
            if (err) throw err
            expect(res).to.have.status(422)
            done()
          })
      })

      step('should not accept a friendship that doesnt exist', async function () {
        await chai.request(url)
          .post(`/api/v1/friendship/badid/accept`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(500)
          })
      })

      step('should accept a friendship with a proper request', async function () {
        await chai.request(url)
          .post(`/api/v1/friendship/${user1.id}/accept`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('friendship')
            expect(res.body.friendship.friender._id).to.equal(user1.id)
          })
        await chai.request(url)
          .get(`/api/v1/friendship`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.friendships.length === 1)
          })
      })

      step('should not accept a valid friendship if not pending', async function () {
        await chai.request(url)
          .post(`/api/v1/friendship/${user1.id}/accept`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(400)
          })
      })

      step('should reject an existing, accepted friendship', async function () {
        await chai.request(url)
          .post(`/api/v1/friendship/${user1.id}/reject`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(200)
          })
        await chai.request(url)
          .get(`/api/v1/friendship`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.friendships.length === 0)
          })
      })

      step('should reject a pending friendship', async function () {
        await chai.request(url)
          .post('/api/v1/friendship')
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ username: user2.username })
        await chai.request(url)
          .get(`/api/v1/friendship/pending`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.friendships.length === 1)
          })
        await chai.request(url)
          .post(`/api/v1/friendship/${user1.id}/reject`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(200)
          })
        await chai.request(url)
          .get(`/api/v1/friendship/pending`)
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${user2Token}`)
          .send()
          .then(function (res, err) {
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.friendships.length === 0)
          })
      })

    })
  })

  afterEach(function () {
    if (this.currentTest.state === 'failed') {
      console.log('    Response body: ' + util.inspect(response.body, { depth: null, colors: true }) + '\n')
    }
  })
})
