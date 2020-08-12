const uuid = require("uuid").v4;
const morgan = require("morgan");
const { config, createLogger, format, transports } = require("winston");

const rfs = require("rotating-file-stream");

// -------------
// Manual logger
// -------------

// CONFIG
const LOG_DIR = "/var/log";
const APP_NAME = "userapi";

const { combine, colorize, timestamp, printf, label } = format;
const { syslog } = config;

// Functions
const getFormattedDate = (date) => date.toISOString().slice(0, 10);
const getFilename = (keyword) =>
  keyword
    ? `${LOG_DIR}/${APP_NAME}-${keyword}_${getFormattedDate(new Date())}.log`
    : `${LOG_DIR}/${APP_NAME}_${getFormattedDate(new Date())}.log`;

// Constants
const customFormat = combine(
  colorize({ all: true }),
  timestamp(),
  label({ label: APP_NAME }),
  printf(
    (info) => `${info.timestamp} [${info.level}] ${info.label}: ${info.message}`
  )
);

const manualLogger = createLogger({
  level: "info",
  levels: syslog.levels,
  format: format.json(),
  transports: [
    new transports.File({
      filename: getFilename("error"),
      level: "error",
    }),
    new transports.File({
      filename: getFilename(),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  manualLogger.add(new transports.Console({ format: customFormat }));
}

// -----------------
// Middleware logger
// -----------------

const correlationId = (req, res, next) => {
  req.id = uuid();
  next();
};

morgan.token("id", function getId(req) {
  return req.id;
});

morgan.token("body", function getId(req) {
  return JSON.stringify(req.body);
});

const apiConsoleLogger = morgan(
  ":id :method :url :status :response-time ms - :res[content-length]"
);

if (process.env.NODE_ENV !== "local") {
  // create a rotating write stream
  var fileStream = rfs.createStream(`${APP_NAME}_requests.log`, {
    interval: "1d", // rotate daily
    path: LOG_DIR,
  });

  const apiFileLogger = morgan(
    ":id :remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length] :body",
    { stream: fileStream }
  );

  module.exports = {
    correlationId,
    apiFileLogger,
    apiConsoleLogger,
    manualLogger,
  };
} else {
  module.exports = {
    correlationId,
    apiConsoleLogger,
    manualLogger,
  };
}
