const errors = require('restify-errors');
const UserModel = require('../../models/user');
const passwords = require('../../utilities/passwords');

export class V1RegisterApi {
  apply(app) {
    // using the `req.user` object provided by restify-jwt
    app.post('/api/v1/register', (req, res, next) => {
      passwords.hash(req.params.password).then((hashedPassword) => {
        const user = new UserModel({
          first_name: req.params.first_name,
          last_name: req.params.last_name,
          username: req.params.username,
          display_name: req.params.display_name,
          email: req.params.email,
          password_hash: hashedPassword,
        });
        user.save()
          .then(doc => {
            console.log(doc)
            res.send(doc);
            next();
          })
          .catch(err => {
            console.error(err)
            res.send(new errors.BadRequestError(err))
            next();
         });
      })
    });
  }
}

export default V1RegisterApi;
