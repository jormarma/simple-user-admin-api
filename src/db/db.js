const { MongoClient, ObjectID } = require("mongodb");
const mongoDBStoreFactory = require("connect-mongodb-session");

const { GenericError } = require("../errors/errors");
const { manualLogger } = require("../middleware/logger");

// Connection URI
const uri =
  process.env.NODE_ENV === "local"
    ? "mongodb://localhost:27017/?poolSize=20&w=majority"
    : "mongodb://userapi-mongo:27017/?poolSize=20&w=majority";

// Create a new MongoClient
const client = new MongoClient(uri, { useUnifiedTopology: true });

let users;

// CAUTION!! externalize this, do not put in code.
const initialize = async (users) => {
  const adminUser = {
    firstName: "Admin",
    lastName: "Nimda",
    email: "admin@test.com",
    password: "$2b$12$YNsSEl3KA.g2vEZSyHPAq.0a3lQG0UWPWwgPMEwAAl2SpFEgcLaqm",
    role: "admin",
    country: "Unknown",
    phoneNumber: "+34555555555",
    postalCode: "12345",
  };

  try {
    const admin = await users.findOne({
      email: "admin@test.com",
      role: "admin",
    });
    if (!admin) {
      await users.insertOne(adminUser);
      manualLogger.info(
        "Admin user created successfully: admin@test.com/J0hn.D03"
      );
    }
  } catch (error) {
    manualLogger.info(error.message);
    process.exit(1);
  }
};

(async () => {
  // Connect the client to the server
  await client.connect();

  // Create the database
  // CAUTION !! Configure a different database for testing
  const usersdb = client.db("usersdb");

  // Create the collection
  users = usersdb.collection("users");

  // Creates a unique index to make sure two users
  // do not have tha same email
  const result = await users.createIndex({ email: 1 }, { unique: true });

  await initialize(users);
  manualLogger.info(JSON.stringify(result));
})();

const insertUser = async (user) => {
  try {
    const result = await users.insertOne(user);
    manualLogger.info(JSON.stringify(result));
    return result.ops[0];
  } catch (error) {
    manualLogger.error(error);

    const { code } = error;

    // Duplicate key error: in our case, it is a duplicate email
    if(code === 11000) {
      throw new GenericError(401, "Database error", `A user with the email '${user.email}' already exists`);
    } else {
      throw new GenericError(code, "Database error", errorMessage);
    }
    const errorMessage =
      code === 11000
        ? `A user with the email '${user.email}' already exists`
        : "Error inserting user";

    throw new GenericError(code, "Database error", errorMessage);
  }
};

const deleteUser = async (_id) => {
  try {
    const result = await users.deleteOne({ _id: ObjectID(_id) });
    manualLogger.info(JSON.stringify(result));
    return { deletedUsers: result.deletedCount };
  } catch (error) {
    manualLogger.error(error);
    const { code } = error;
    throw new GenericError(
      code,
      "Database error",
      `Error deleting user ${_id}`
    );
  }
};

const getUserByEmail = async (email) => {
  try {
    const result = await users.findOne({ email });
    manualLogger.info(JSON.stringify(result));
    return result;
  } catch (error) {
    manualLogger.error(error);
    const { code } = error;
    throw new GenericError(
      code,
      "Database error",
      `Error getting user with email ${email}`
    );
  }
};

const getUser = async (userid) => {
  try {
    const result = await users.findOne({ _id: ObjectID(userid) });
    manualLogger.info(JSON.stringify(result));
    return result;
  } catch (error) {
    manualLogger.error(error);
    const { code } = error;
    throw new GenericError(
      code,
      "Database error",
      `The user with id '${userid}' does not exist`
    );
  }
};

const listUsers = async () => {
  try {
    const result = await users.find({}).toArray();
    manualLogger.info(`ALL USERS: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    manualLogger.error(error);
    const { code } = error;
    throw new GenericError(code, "Database error", "Error getting users");
  }
};

const countAdminUsers = async () => {
  try {
    const numberOfAdmins = await users.countDocuments({ role: "admin" });
    manualLogger.info(`There are ${numberOfAdmins} administrator users.`);
    return numberOfAdmins;
  } catch (error) {
    manualLogger.error(error);
    const { code } = error;
    throw new GenericError(
      code,
      "Database error",
      "Error counting administrator users."
    );
  }
};

const updateUser = async (userid, user) => {
  try {
    const userFields = Object.assign({}, user);

    // You can not try to update the _id of a record.
    delete userFields._id;

    const result = await users.updateOne(
      { _id: ObjectID(userid) },
      { $set: { ...userFields } }
    );
    if (result.result.ok === 1) {
      const updatedUser = Object.assign(user, { _id: userid });
      manualLogger.info(JSON.stringify(updatedUser));
      return updatedUser;
    }

    return {};
  } catch (error) {
    manualLogger.error(error);
    const { code } = error;
    throw new GenericError(
      code,
      `Database error", "Error updating user ${userid} users`
    );
  }
};

const getSessionStore = (session) => {
  const MongoDBStore = mongoDBStoreFactory(session);
  return new MongoDBStore({
    uri,
    databaseName: "usersdb",
    collection: "sessions",
  });
};

// CRUD methods
module.exports = {
  insertUser,
  getUserByEmail,
  getUser,
  listUsers,
  updateUser,
  deleteUser,
  getSessionStore,
  countAdminUsers,
  initialize,
};
