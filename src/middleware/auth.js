const { apiError } = require("../apiResult");

const isLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res
      .status(401)
      .json(apiError("You need to be logged in to execute this action"));
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res
      .status(401)
      .json(
        apiError("You need to be an 'Administrator' to perform this action")
      );
  }
  next();
};

// This is used when a user wants to register
const registerAdminUser = (req, res, next) => {
  const role = req.body.role;

  if (role === "admin" && !req.session.isAdmin) {
    return res
      .status(401)
      .json(
        apiError(
          "You need to be an 'Administrator' to register another 'Administrator'"
        )
      );
  }
  next();
};

module.exports = { isLoggedIn, isAdmin, registerAdminUser };
