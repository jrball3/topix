const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;

class PasswordHash() {
  hash(password) {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }
}
