const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const util = require('util')
const mockUserDetails = require('./helpers').mockUserDetails

const url = 'http://localhost:3000'

/* global describe it before afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('user', function () {
      let response, token
      const user = mockUserDetails()

      before(function (done) {
        chai
          .request(url)
          .post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send(user)
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
            username: user.username,
            password: user.password
          })
          .end(function (err, res) {
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.token).to.not.equal(null)
            token = res.body.token
            done()
          })
      })

      it('should properly return the user data', function (done) {
        chai.request(url)
          .get('/api/v1/user')
          .set('Authorization', `Jwt ${token}`)
          .send()
          .end(function (err, res) {
            response = res
            if (err) throw err
            expect(res).to.have.status(200)
            expect(res.body.firstName).to.equal(user.firstName)
            expect(res.body.lastName).to.equal(user.lastName)
            expect(res.body.username).to.equal(user.username.toLowerCase())
            expect(res.body.email).to.equal(user.email.toLowerCase())
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
