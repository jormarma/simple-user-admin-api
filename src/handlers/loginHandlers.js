const { apiResult, apiError } = require("../apiResult");
const loginManager = require("../managers/loginManager");

const { manualLogger } = require("../middleware/logger");

const login = async (req, res) => {
  // Already logged in
  if (req.session && req.session.isLoggedIn) {
    manualLogger.info("The user is already logged in");
    return res
      .status(202)
      .json(apiResult("Already logged in. Log out before log in again."));
  }

  // Get credentials to log in
  const userCredentials = req.body;
  try {
    const user = await loginManager.login(userCredentials);
    if (user) {
      req.session.isLoggedIn = true;
      req.session.isAdmin = user.role === "admin";
      req.session.user = user;
    }
    res.json(apiResult({ user }));
  } catch (error) {
    res.status(400).json(apiError(error.message));
  }
};

const logout = async (req, res) => {
  try {
    await loginManager.logout(req.session);
    res.json(apiResult());
  } catch (error) {
    res.status(400).json(apiError(error.message));
  }
};

module.exports = {
  login,
  logout,
};
