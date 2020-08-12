const db = require("../db/db");
const hash = require("../auth/hash");
const { GenericError } = require("../errors/errors");

const { manualLogger } = require("../middleware/logger");

const login = async ({ email, password }) => {
  const user = await db.getUserByEmail(email);
  if (user && hash.compareHashedPassword(password, user.password)) {
    const { password, ...userLite} = user;
    return userLite;
  } else {
    throw new GenericError(
      null,
      "Login Error",
      "The email or password are incorrect"
    );
  }
};

const logout = (session) => {
  if (session) {
    session.destroy((error) => {
      if (error) {
        manualLogger.error(error);
      }
    });
  }
};

module.exports = { login, logout };
