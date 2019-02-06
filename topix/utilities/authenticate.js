const UserModel = require('../models/user')
const Passwords = require('./passwords')

class Authenticate {
  authenticate (username, password) {
    return new Promise(function (resolve, reject) {
      UserModel
        .find({ username })
        .then(doc => {
          Passwords.hash(password)
            .then(hashed => {
              resolve(Passwords.compare(hashed, doc.passwordHash))
            })
            .catch(err => {
              console.log(err)
              reject(err)
            })
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })
  }
};

module.exports = new Authenticate()
