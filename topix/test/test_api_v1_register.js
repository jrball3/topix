const expect = require('chai').expect
const supertest = require('supertest')
const faker = require('faker')
const util = require('util')

const url = `http://localhost:3000`
const api = supertest(url)

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
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            email,
            password
          })
          .expect(400)
          .end(function (err, res) {
            if (err) throw err
            response = res
            done()
          })
          /* eslint-disable-next-line handle-callback-err */
      })

      it('should fail with no email', function (done) {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            username,
            password
          })
          .expect(400)
          .end(function (err, res) {
            if (err) throw err
            response = res
            done()
          })
      })

      it('should fail with no password', function (done) {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            email,
            username
          })
          .expect(400)
          .end(function (err, res) {
            if (err) throw err
            response = res
            done()
          })
      })

      it('should fail with a bad email', function (done) {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            username,
            password,
            email: 'testemailemail.com'
          })
          .expect(400)
          .end(function (err, res) {
            if (err) throw err
            response = res
            done()
          })
      })

      it('should pass with good input', function (done) {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName,
            lastName,
            email,
            username,
            password
          })
          .expect(200)
          .end(function (err, res) {
            if (err) throw err
            response = res
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
