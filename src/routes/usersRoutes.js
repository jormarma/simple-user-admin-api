const express = require("express");
const router = express.Router();

const {
  isLoggedIn,
  isAdmin,
  registerAdminUser,
} = require("../middleware/auth");

const {
  registerUser,
  removeUser,
  updateUser,
  listUsers,
} = require("../handlers/usersHandlers");

router.post("/users", registerAdminUser, registerUser);
router.get("/users", isLoggedIn, isAdmin, listUsers);
router.put("/users/:userid", isLoggedIn, registerAdminUser, updateUser);
router.delete("/users/:userid", isLoggedIn, removeUser);

module.exports = router;
