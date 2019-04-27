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
      let user1Token

      before(function (done) {
        registerUser(user1)
        .then(function(res, err) {
          response = res
          if (err) throw err
          return authUser(user1)
        })
        .then(function (res, err) {
          response = res
          user1Token = res.body.token
          if (err) throw err
          return registerUser(user2)
        })
        .then(function(res, err) {
          response = res
          if (err) throw err
          done()
        })
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
    })
  })

  afterEach(function () {
    if (this.currentTest.state === 'failed') {
      console.log('    Response body: ' + util.inspect(response.body, { depth: null, colors: true }) + '\n')
    }
  })
})
