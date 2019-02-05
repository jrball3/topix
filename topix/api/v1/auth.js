import User from './models/user';
const rjwt = require('restify-jwt-community');

class V1AuthApi {
  constructor(exclusions) {
    this.exclusions = exclusions || [];
  }

  apply = (app) => {
    // using restify-jwt to lock down everything except /auth
    app.use(rjwt(process.env.JWT_SECRET).unless({
        path: this.exclusions,
    }));

    app.post('api/v1/auth', (req, res, next) => {
        let { username, password } = req.body;
        User.authenticate(username, password).then(data => {
            // creating jsonwebtoken using the secret from config.json
            let token = jwt.sign(data, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            // retrieve issue and expiration times
            let { iat, exp } = jwt.decode(token);
            res.send({ iat, exp, token });
            next();
        })
    });
  }
}
