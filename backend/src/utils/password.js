const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Hash a plain password
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Compare plain password with hash
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
