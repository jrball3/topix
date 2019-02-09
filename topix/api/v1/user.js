class V1UserApi {
  apply (app) {
    app.get('/api/v1/user', (req, res, next) => {
      // using the `req.user` object provided by restify-jwt
      res.send(req.user)
      return next()
    })
  }
}

module.exports = { V1UserApi }
