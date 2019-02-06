const UserModel = require('../models/user')
const Passwords = require('./passwords')

class Authenticate {
  authenticate (username, password) {
    return new Promise(function (resolve, reject) {
      UserModel
        .find({ username })
        .then(
          doc => {
            const user = doc[0]
            if (!user) {
              resolve(null)
              return
            }
            Passwords.compare(password, user.passwordHash).then(
              equal => resolve(equal ? user : null),
              err => reject(err)
            )
          },
          err => {
            console.error(err)
            reject(err)
          }
        )
    })
  }
};

module.exports = new Authenticate()
