import models from '../../models';

export class V1UserApi {
  apply(app) {
    // using the `req.user` object provided by restify-jwt
    app.get('/api/v1/user', (req, res, next) => {
      models.User.findAll({ where: { id: req.params.id } }).then((user) => {
        res.send(req.user);
        next();
      });
    });
  }
}

export default V1UserApi;
