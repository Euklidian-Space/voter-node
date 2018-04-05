const { flow } = require("lodash/fp");
const _handlers = Object.values(require("./handlers"));

function errorHandler(errObj, res) {
  const handleErrWithResponse = handlers(errObj);

  return handleErrWithResponse(res);
}

function handlers(errObj) {
  return flow(
    ..._handlers,
    _default
  )(errObj);
}


function _default(errObj) {
  if (errObj.processed) {
    return errObj.passedHandler;
  }

  return res => {
    res.status(500).send(errObj);
    return Promise.reject(errObj);
  };
}

module.exports = errorHandler;