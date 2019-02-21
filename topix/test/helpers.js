const faker = require('faker')
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const url = 'http://localhost:3000'

module.exports = {
  mockUserDetails: function () {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: faker.internet.password()
    }
  },

  registerUser: (user, done) => {
    chai.request(url)
      .post('/api/v1/user')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send(user)
      .end(function (err, res) {
        if (err) throw err
        done(res)
      })
  },

  authUser: (user, done) => {
    chai.request(url)
      .post('/api/v1/auth')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        username: user.username,
        password: user.password
      })
      .end(function (err, res) {
        if (err) throw err
        done(res)
      })
  }
}
