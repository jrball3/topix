const bcrypt = require('bcryptjs')
const BCRYPT_SALT_ROUNDS = 12

class Passwords {
  async hash (password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
  }

  async compare (pass1, pass2) {
    return await bcrypt.compare(pass1, pass2)
  }
}

module.exports = new Passwords()
