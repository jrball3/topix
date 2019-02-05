const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;

export class PasswordHash {
  hash(password) {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  compare(pass1, pass2) {
    return bcrypt.compare(pass1, pass2);
  }
}

export default PasswordHash;
