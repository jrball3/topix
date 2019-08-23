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
      email: faker.internet.email().toLowerCase(),
      username: faker.internet.userName().toLowerCase(),
      password: faker.internet.password()
    }
  },

  registerUser: (user) => (
    chai.request(url)
      .post('/api/v1/user')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send(user)
  ),

  authUser: (user) => (
    chai.request(url)
      .post('/api/v1/auth')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        username: user.username,
        password: user.password
      })
  ),

  createGame: (token, gameName, gameType, players) => (
    chai.request(url)
      .post('/api/v1/game')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: gameName,
        type: gameType,
        players: players.map(p => p.username),
      })
  ),

  createPost: (token, game, message) => (
    chai.request(url)
      .post('/api/v1/post')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .send({
        gameId: game.id,
        message,
      })
  ),

  fetchGame: (token, gameId) => (
    chai.request(url)
      .get('/api/v1/game')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId  })
  ),

  fetchScore: (token, gameId) => (
    chai.request(url)
      .get('/api/v1/score')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .query({ gameId })
  ),

  fetchPost: (token, gameId) => (
    chai.request(url)
      .get('/api/v1/post')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .query({ gameId })
  )
}
