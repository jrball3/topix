const bcrypt = require('bcryptjs')
const BCRYPT_SALT_ROUNDS = 12

class Passwords {
  hash (password) {
    return new Promise(function (resolve, reject) {
      try {
        resolve(bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS))
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  }

  compare (pass1, pass2) {
    return new Promise(function (resolve, reject) {
      try {
        resolve(bcrypt.compareSync(pass1, pass2))
      } catch (err) {
        console.error(err)
        reject(err)
      }
    })
  }
}

module.exports = new Passwords()
