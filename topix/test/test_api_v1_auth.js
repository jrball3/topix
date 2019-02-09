const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const util = require('util')
const faker = require('faker')

/* global describe it before afterEach */
const url = 'http://localhost:3000'

describe('api', function () {
  describe('v1', function () {
    describe('auth', function () {
      let response
      const user = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: faker.internet.password()
      }

      before(function (done) {
        chai.request(url)
          .post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send(user)
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
            done()
          })
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
            if (err) throw err
            expect(res).to.have.status(401)
            done()
          })
      })

      it('should auth with the correct password', function (done) {
        chai.request(url)
          .post('/api/v1/auth')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            username: user.username,
            password: user.password
          })
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
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
