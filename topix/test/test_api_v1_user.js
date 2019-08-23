const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const util = require('util')
const { mockUserDetails, registerUser, authUser } = require('./helpers')

const url = 'http://localhost:3000'

/* global describe it before beforeEach afterEach */

describe('api', function () {
  let response

  describe('v1', function () {
    describe('user', function () {
      describe('get', function () {
        let token
        const user = mockUserDetails()

        before(async function () {
          this.timeout(5000)
          await registerUser(user)
          const auth = await authUser(user)
          token = auth.body.token
        })

        it('should properly return the user data', function (done) {
          chai.request(url)
            .get('/api/v1/user')
            .set('Authorization', `Bearer ${token}`)
            .send()
            .end(function (err, res) {
              response = res
              if (err) throw err
              expect(res).to.have.status(200)
              expect(res.body.firstName).to.equal(user.firstName)
              expect(res.body.lastName).to.equal(user.lastName)
              expect(res.body.username).to.equal(user.username)
              expect(res.body.email).to.equal(user.email)
              done()
            })
        })

        it('should return an error if unauthorized', function (done) {
          chai.request(url)
            .get('/api/v1/user')
            .send()
            .end(function (err, res) {
              response = res
              if (err) throw err
              expect(res).to.have.status(401)
              done()
            })
        })
      })

      describe('post', function () {
        let user

        beforeEach(function () {
          user = mockUserDetails()
        })

        it('should fail with no username', function (done) {
          chai.request(url)
            .post('/api/v1/user')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              password: user.password
            })
            .end(function (err, res) {
              response = res
              if (err) throw err
              expect(res).to.have.status(400)
              done()
            })
            /* eslint-disable-next-line handle-callback-err */
        })

        it('should fail with no email', function (done) {
          chai.request(url)
            .post('/api/v1/user')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              password: user.password
            })
            .end(function (err, res) {
              if (err) throw err
              response = res
              expect(res).to.have.status(400)
              done()
            })
        })

        it('should fail with no password', function (done) {
          chai.request(url)
            .post('/api/v1/user')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              username: user.username
            })
            .end(function (err, res) {
              response = res
              if (err) throw err
              expect(res).to.have.status(400)
              done()
            })
        })

        it('should fail with a bad email', function (done) {
          chai.request(url)
            .post('/api/v1/user')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              password: user.password,
              email: 'testemailemail.com'
            })
            .end(function (err, res) {
              response = res
              if (err) throw err
              expect(res).to.have.status(400)
              done()
            })
        })

        it('should create a user with good input', function (done) {
          chai.request(url)
            .post('/api/v1/user')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send(user)
            .end(function (err, res) {
              response = res
              if (err) throw err
              expect(res).to.have.status(200)
              expect(res.body.firstName).to.equal(user.firstName)
              expect(res.body.lastName).to.equal(user.lastName)
              expect(res.body.username).to.equal(user.username)
              expect(res.body.email).to.equal(user.email)
              expect(res.body.passwordHash).to.not.equal(null)
              done()
            })
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
