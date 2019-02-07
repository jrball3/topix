const assert = require('assert')
const should = require('chai').should()
const expect = require('chai').expect
const supertest = require('supertest')

const url = `http://localhost:${process.env.API_PORT}`
const api = supertest(url)

/* global describe it */

describe('api', () => {
  describe('v1', () => {
    describe('register', () => {
      it('should fail with no username', (done) => {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName: 'john',
            lastName: 'doe',
            email: 'testemail@email.com',
            password: 'testpassword123'
          })
          .expect(400, done)
          /* eslint-disable-next-line handle-callback-err */
      })

      it('should fail with no email', (done) => {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName: 'john',
            lastName: 'doe',
            username: 'johndoe',
            password: 'testpassword123'
          })
          .expect(400, done)
      })

      it('should fail with no password', (done) => {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName: 'john',
            lastName: 'doe',
            username: 'johndoe',
            email: 'testemail@email.com'
          })
          .expect(400, done)
      })

      it('should fail with a bad email', (done) => {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName: 'john',
            lastName: 'doe',
            username: 'johndoe',
            email: 'testemailemail.com',
            password: 'testpassword123'
          })
          .expect(400, done)
      })

      it('should pass with good input', (done) => {
        api.post('/api/v1/register')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            firstName: 'john',
            lastName: 'doe',
            username: 'johndoe',
            email: 'testemail@email.com',
            password: 'testpassword123'
          })
          .expect(200)
          .end((err, res) => {
            expect(err).to.equal(null)
            expect(res.body.firstName).to.equal('john')
            expect(res.body.lastName).to.equal('doe')
            expect(res.body.username).to.equal('johndoe')
            expect(res.body.email).to.equal('testemail@email.com')
            expect(res.body.passwordHash).to.not.equal(null)
            done()
          })
      })
    })
  })
})
