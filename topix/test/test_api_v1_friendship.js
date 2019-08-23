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

      before(async function () {
        this.timeout(5000)
        await registerUser(user1)
        const auth = await authUser(user1)
        user1Token = auth.body.token
        await registerUser(user2)
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
