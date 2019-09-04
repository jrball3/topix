const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const util = require('util')
const { mockUserDetails, registerUser } = require('./helpers')

const url = 'http://localhost:3000'

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('auth', function () {
      const user = mockUserDetails()
      let token
      let response

      before(async function () {
        this.timeout(5000)
        await registerUser(user)
      })

      it('should not auth with the wrong password', function (done) {
        chai.request(url)
          .post('/api/v1/auth')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            username: user.username,
            password: 'badpassword'
          })
          .end(function (err, res) {
            response = res
            token = response.body.token
            if (err) throw err
            expect(res).to.have.status(401)
            done()
          })
      })

      it('should auth with the correct password', async function () {
        await chai.request(url)
          .post('/api/v1/auth')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            username: user.username,
            password: user.password
          })
          .then(function (res, err) {
            response = res
            token = res.body.token
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.createdAt).to.not.equal(null)
            expect(res.body.expiredAt).to.not.equal(null)
            expect(res.body.token).to.not.equal(null)
          })
      })

      it('should return a good check for a good token', async function () {
        await chai.request(url)
          .post('/api/v1/auth/check')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({ token })
          .then(function (res, err) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.createdAt).to.not.equal(null)
            expect(res.body.expiredAt).to.not.equal(null)
            expect(res.body.token).to.not.equal(null)
          })
      })

      it('should return a bad check for a bad token', async function () {
        await chai.request(url)
          .post('/api/v1/auth/check')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({ token: 'badtoken' })
          .then(function (err, res) {
            expect(err).to.have.status(401)
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
