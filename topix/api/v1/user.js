const UserModel = require('../../models/user');
const errors = require('restify-errors');

export class V1UserApi {
  apply(app) {
    // using the `req.user` object provided by restify-jwt
    app.get('/api/v1/user', (req, res, next) => {
      UserModel
        .find({
          id: req.params.id,
          username: req.params.username,
        })
        .then(doc => {
          console.log(doc)
          res.send(doc);
          next();
        })
        .catch(err => {
          console.error(err)
          res.send(new errors.BadRequestError(err));
          next();
        });
    });
  }
}

export default V1UserApi;
