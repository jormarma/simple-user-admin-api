const textjson = (req, res, next) => {
  res.setHeader("Content-Type", "text/json");
  next();
};

module.exports = { textjson };
