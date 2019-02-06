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
            console.log(user)
            if (!user) {
              resolve(null)
              return
            }
            Passwords.hash(password)
              .then(
                hashed => {
                  const same = Passwords.compare(hashed, user.passwordHash)
                  resolve(same ? user : null)
                },
                err => {
                  console.log(err)
                  reject(err)
                }
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
