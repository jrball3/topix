const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const mockUserDetails = require('./helpers').mockUserDetails

const url = 'http://localhost:3000'

/* global describe it step before */

describe('api', function () {
  describe('v1', function () {
    describe('friendship', function () {
      const user1 = mockUserDetails()
      const user2 = mockUserDetails()
      let token

      before(function (done) {
        chai.request(url)
          .post('/api/v1/user')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send(user1)
          .end(function (err, res) {
            if (err) throw err
            expect(res).to.have.status(200)
            done()
          })
      })

      before(function (done) {
        chai.request(url)
          .post('/api/v1/user')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send(user2)
          .end(function (err, res) {
            if (err) throw err
            expect(res).to.have.status(200)
            done()
          })
      })

      before(function (done) {
        chai.request(url)
          .post('/api/v1/auth')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            username: user1.username,
            password: user1.password
          })
          .end(function (err, res) {
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.token).to.not.equal(null)
            token = res.body.token
            done()
          })
      })

      it('should return an error if the user does not exist', function (done) {
        chai.request(url)
          .post('/api/v1/friendship')
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Authorization', `Bearer ${token}`)
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
          .set('Authorization', `Bearer ${token}`)
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
          .set('Authorization', `Bearer ${token}`)
          .send({ username: user2.username })
          .end(function (err, res) {
            if (err) throw err
            expect(res).to.have.status(422)
            done()
          })
      })
    })
  })
})
