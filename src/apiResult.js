const apiResult = (result = {}) => ({ ok: true, result });
const apiError = (error) => ({ ok: false, error });

module.exports = {
  apiResult,
  apiError,
};
