const { apiError } = require("../apiResult");
const { manualLogger } = require("../middleware/logger");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  manualLogger.error(err.stack);
  res.status(500).json(apiError("Unexpected error"));
};

module.exports = errorHandler;
