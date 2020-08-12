const expressSession = require("express-session");

const { getSessionStore } = require("../db/db");

const SESSION_SECRET = "ce830699-4771-4454-ba39-fadd2275fc60";

const session = expressSession({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: getSessionStore(expressSession),
});

module.exports = { session };
