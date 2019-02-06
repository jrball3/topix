export class V1UserApi {
  apply (app) {
    app.get('/api/v1/user', (req, res, next) => {
      // using the `req.user` object provided by restify-jwt
      res.send(req.user)
    })
  }
}

export default V1UserApi
