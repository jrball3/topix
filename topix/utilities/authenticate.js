const UserModel = require('../models/user');
const Passwords = require('./passwords');

class Authenticate {
  authenticate(username, password) {
    return new Promise(function(resolve, reject) {
      UserModel
        .find({ username })
        .then(doc => {
          resolve(Passwords.compare(password, doc.password));
        })
        .catch(err => {
          console.error(err)
          reject(err);
        });
    });
  }
};

module.exports = new Authenticate();
