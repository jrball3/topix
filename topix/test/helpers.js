const faker = require('faker')
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const url = 'http://localhost:3000'

module.exports = {
  mockUserDetails: function () {
    return {
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

  createPost: (token, gameId, message) => (
    chai.request(url)
      .post('/api/v1/post')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .send({
        gameId,
        message,
      })
  ),

  fetchOneGame: (token, gameId) => (
    chai.request(url)
      .get(`/api/v1/game/${gameId}`)
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .send()
  ),

  fetchGames: (token) => (
    chai.request(url)
      .get('/api/v1/game')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .send()
  ),

  fetchScores: (token, gameId) => (
    chai.request(url)
      .get('/api/v1/score')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .query({ gameId })
  ),

  fetchPost: ({
    token, 
    gameId, 
    postId,
  }) => (
    chai.request(url)
      .get(postId ? `/api/v1/post/${postId}`: '/api/v1/post')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Authorization', `Bearer ${token}`)
      .query({ gameId })
  )
}
