const db = require("../db/db");
const hash = require("../auth/hash");
const { GenericError } = require("../errors/errors");

const removePassword = (withPassword) => {
  if (!Array.isArray(withPassword)) {
    const { password, ...withoutPassword } = withPassword;
    return withoutPassword;
  } else {
    return withPassword.map((user) => {
      const { password, ...liteUser } = user;
      return liteUser;
    });
  }
};

const formatUserData = (user) => {
  if (user.password) {
    user.password = hash.getHashedPassword(user.password);
  }

  if (user.phoneNumber) {
    user.phoneNumber = user.phoneNumber.replace(/[\s.-]/g, "");
  }

  return user;
};

const registerUser = async (user) => {
  const newUser = formatUserData(user);
  return removePassword(await db.insertUser(newUser));
};

const listUsers = async () => removePassword(await db.listUsers());

const getUserByEmail = async (email) =>
  removePassword(await db.getUserByEmail(email));

const getUpdatedUser = (oldUser) => {
  if (oldUser.newPassword) {
    const { ...updatedUser } = oldUser;
    updatedUser.password = updatedUser.newPassword;
    delete updatedUser.newPassword;
    return updatedUser;
  }

  return oldUser;
};

const updateUser = async (userid, user, isAdmin) => {
  let validUserId = userid;

  if (user._id && user._id !== userid) {
    if (isAdmin) {
      validUserId = user._id;
    } else {
      throw new GenericError(
        401,
        "Update Error",
        "Only an 'Administrator' user can update another user's data"
      );
    }
  }

  const existingUser = await db.getUser(validUserId);

  if (!existingUser) {
    throw new GenericError(
      null,
      "Update Error",
      `The user with the id '${validUserId}' does not exist`
    );
  } else if (
    !hash.compareHashedPassword(user.password, existingUser.password)
  ) {
    throw new GenericError(
      null,
      "Update Error",
      "The current password of the user is incorrect."
    );
  } else {
    const updatedUser = getUpdatedUser(user);
    const formattedUser = formatUserData(updatedUser);
    const resultUser = await db.updateUser(
      validUserId,
      getUpdatedUser(formattedUser)
    );
    return removePassword(resultUser);
  }
};

const removeUser = async (userid, isAdmin) => {
  const user = await db.getUser(userid);

  // the user to remove is an admin user
  if (user.role === "admin") {
    // It is an admin user
    if (isAdmin) {
      const numberOfAdmins = await db.countAdminUsers();

      // It is the only admin user
      if (numberOfAdmins === 1) {
        throw new GenericError(
          403,
          "Remove Error",
          "Unable to remove the last 'Administrator' user."
        );
      }
    } else {
      // It is a non admin user trying to remove an admin user.
      throw new GenericError(
        401,
        "Remove Error",
        "Only an 'Administrator' user can remove another 'Administrator' user."
      );
    }
  }

  // It is a role=user user and is logged in
  return await db.deleteUser(userid);
};

module.exports = {
  registerUser,
  listUsers,
  getUserByEmail,
  updateUser,
  removeUser,
  formatUserData,
};
