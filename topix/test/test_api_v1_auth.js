const expect = require('chai').expect
const supertest = require('supertest')
const util = require('util')
const faker = require('faker')

const url = `http://localhost:3000`
const api = supertest(url)

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('auth', function () {
      this.timeout(10000)
      let response
      const user = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password()
      }

      before(function (done) {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send(user)
          .expect(200)
          .end(function (err, res) {
            if (err) throw err
            done()
          })
      })

      it('should not auth with the wrong password', function (done) {
        api.post('/api/v1/auth')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            username: user.username,
            password: 'badpassword'
          })
          .expect(401)
          .end(function (err, res) {
            if (err) throw err
            response = res
            done()
          })
      })

      it('should auth with the correct password', function (done) {
        api.post('/api/v1/auth')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            username: user.username,
            password: user.password
          })
          .expect(200)
          .end(function (err, res) {
            if (err) throw err
            response = res
            console.log(res.body)
            console.log(res.statusCode)
            expect(res.body.createdAt).to.not.equal(null)
            expect(res.body.expiredAt).to.not.equal(null)
            expect(res.body.token).to.not.equal(null)
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
