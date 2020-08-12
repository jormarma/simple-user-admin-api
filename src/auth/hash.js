const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

const getHashedPassword = (password) => {
  return bcrypt.hashSync(password, SALT_ROUNDS);
};

const compareHashedPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { getHashedPassword, compareHashedPassword };
