const userManager = require("../managers/usersManager");
const loginManager = require("../managers/loginManager");
const { apiResult, apiError } = require("../apiResult");

const registerUser = async (req, res) => {
  const user = req.body;

  try {
    const registeredUser = await userManager.registerUser(user);
    res.status(201).json(apiResult({ user: registeredUser }));
  } catch (error) {
    res.status(403).json(apiError(error.message));
  }
};

const removeUser = async (req, res) => {
  const { userid } = req.params;

  try {
    // A user can only delete itself
    const result = await userManager.removeUser(userid, req.session.isAdmin);
    // If a user is deleted successfully, it also needs to remove its session
    await loginManager.logout(req.session);
    res.json(apiResult(result));
  } catch (error) {
    const errorResponse = apiError(error.message);

    if (error.code) {
      res.status(error.code).json(errorResponse);
    } else {
      res.status(400).json(errorResponse);
    }
  }
};

const updateUser = async (req, res) => {
  const { userid } = req.params;
  const user = req.body;

  try {
    const updatedUser = await userManager.updateUser(
      userid,
      user,
      req.session.isAdmin
    );
    res.json(apiResult({ user: updatedUser }));
  } catch (error) {
    res.status(400).json(apiError(error.message));
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await userManager.listUsers();
    // Removes the password from the returned users
    const usersLite = users.map((user) => {
      const { password, ...liteUser } = user;
      return liteUser;
    });
    res.json(apiResult({ users: usersLite }));
  } catch (error) {
    res.status(400).json(apiError(error.message));
  }
};

module.exports = {
  registerUser,
  removeUser,
  updateUser,
  listUsers,
};
