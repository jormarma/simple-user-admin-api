const express = require("express");
const {
  apiFileLogger,
  apiConsoleLogger,
  manualLogger,
  correlationId,
} = require("./middleware/logger");
const bodyParser = require("body-parser");
const { validator } = require("./middleware/validator");
const { textjson } = require("./middleware/textjson");
const { session } = require("./middleware/session");
const usersRoutes = require("./routes/usersRoutes");
const loginRoutes = require("./routes/loginRoutes");
const errorHandler = require("./middleware/errors");

// Configuration
const PORT = 3000;
const API_BASE_PATH = "/userapi/v1";

const app = express();

// Set the response type to text/json for all responses
app.use(textjson);

// parse application/json request body and put it in a body property of the request
app.use(bodyParser.json());

// Loggers
app.use(correlationId);
app.use(apiConsoleLogger);

if (process.env.NODE_ENV !== "local") {
  app.use(apiFileLogger);
}

// Middleware
app.use(session);

// uses the validation of the body, depending on the method call
app.use(validator);

// The las middleware to add is the custom error handler for not handled errors
app.use(errorHandler);

// Routes
app.use(API_BASE_PATH, usersRoutes);
app.use(API_BASE_PATH, loginRoutes);

// Start
app.listen(PORT, () => {
  manualLogger.info(`Example app listening at ${PORT}`);
});
