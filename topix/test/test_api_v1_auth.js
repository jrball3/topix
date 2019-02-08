const expect = require('chai').expect
const supertest = require('supertest')
const util = require('util')
const createUser = require('./helpers').createUser

const url = `http://localhost:3000`
const api = supertest(url)

/* global describe it before beforeEach afterEach */

describe('api', function () {
  describe('v1', function () {
    describe('auth', function () {
      let user, response

      before(function (done) {
        createUser()
          .then((doc) => {
            user = doc
            console.log('save done!')
            console.log('is new?? ' + doc.isNew)
            done()
          })
          .catch(err => {
            console.error('something is fucked')
            throw err
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
