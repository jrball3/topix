const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const util = require('util')
const faker = require('faker')

const url = `http://localhost:3000`

/* global describe it beforeEach afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('register', function () {
      let response, firstName, lastName, username,
        email, password

      beforeEach(function (done) {
        firstName = faker.name.firstName()
        lastName = faker.name.lastName()
        email = faker.internet.email()
        username = faker.internet.userName()
        password = faker.internet.password()
        done()
      })

      it('should fail with no username', function (done) {
        chai.request(url)
          .post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            email,
            password
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
          .post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            username,
            password
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
          .post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            email,
            username
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
          .post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            username,
            password,
            email: 'testemailemail.com'
          })
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(400)
            done()
          })
      })

      it('should pass with good input', function (done) {
        const goodUser = {
          firstName,
          lastName,
          email,
          username,
          password
        }
        chai.request(url)
          .post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send(goodUser)
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.firstName).to.equal(firstName)
            expect(res.body.lastName).to.equal(lastName)
            expect(res.body.username).to.equal(username.toLowerCase())
            expect(res.body.email).to.equal(email.toLowerCase())
            expect(res.body.passwordHash).to.not.equal(null)
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
