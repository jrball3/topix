import User from './models/user';

class V1UserApi {
  apply = (app) => {
    // using the `req.user` object provided by restify-jwt
    app.get('api/v1/user', (req, res, next) => {
      User.findAll({ where: { id: req.params.id } }).then((user) => {
        res.send(req.user);
        next();
      });
    });
  }
}
