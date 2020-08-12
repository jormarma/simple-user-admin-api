const Ajv = require("ajv");

const fs = require("fs");

const { apiError } = require("../apiResult");

const SCHEMA_BASE_URI = "http://jorge.marti.marin/schemas/userapi";

const readSchema = (path) => {
  const jsonSchema = fs.readFileSync(path);
  return JSON.parse(jsonSchema);
};

const definitions = readSchema("schemas/definitions.json");
const registerUserSchema = readSchema("schemas/registerUserSchema.json");
const loginUserSchema = readSchema("schemas/loginUserSchema.json");
const updateUserSchema = readSchema("schemas/updateUserSchema.json");

const ajv = Ajv({
  allErrors: true,
  schemas: [definitions, registerUserSchema, loginUserSchema, updateUserSchema],
});
const validateRegisterUser = ajv.getSchema(
  `${SCHEMA_BASE_URI}/registerUserSchema.json`
);
const validateLoginUser = ajv.getSchema(
  `${SCHEMA_BASE_URI}/loginUserSchema.json`
);
const validateUpdateUser = ajv.getSchema(
  `${SCHEMA_BASE_URI}/updateUserSchema.json`
);

const validator = (req, res, next) => {
  const { originalUrl, method, body } = req;

  if (originalUrl === "/userapi/v1/users" && method === "POST") {
    if (!validateRegisterUser(body)) {
      return res
        .status(400)
        .json(apiError({ validationErrors: validateRegisterUser.errors }));
    }
  } else if (originalUrl === "/userapi/v1/login" && method === "POST") {
    if (!validateLoginUser(body)) {
      return res
        .status(400)
        .json(apiError({ validationErrors: validateLoginUser.errors }));
    }
  } else if (
    originalUrl.match(/^\/userapi\/v1\/users\/[^/]+$/) &&
    method === "PUT"
  ) {
    if (!validateUpdateUser(body)) {
      return res
        .status(400)
        .json(apiError({ validationErrors: validateUpdateUser.errors }));
    }
  }

  next();
};

module.exports = { validator };
