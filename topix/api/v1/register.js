import models from '../../models';
import PasswordHash from '../../utilities/passwords';

export class V1RegisterApi {
  apply(app) {
    // using the `req.user` object provided by restify-jwt
    app.post('/api/v1/register', (req, res, next) => {
      const user = models.User.build({
        first_name: req.params.first_name,
        last_name: req.params.last_name,
        username: req.params.username,
        display_name: req.params.display_name,
        email: req.params.email,
      });
      PasswordHash.hash(req.params.password).then((hashedPassword) => {
        user.password_hash = hashedPassword;
        user.save().then((savedUser) => {
          res.send(savedUser.toJSON());
          next();
        })
      })
    });
  }
}

export default V1RegisterApi;
