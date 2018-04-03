const { flow } = require("lodash/fp");
const { INTERNAL_ERR, UserErrs } = require("./error_types");

function errorHanlder(errObj) {
  return handlers(errObj);
}

function handlers(errObj) {
  return flow(
    handleValidationError,
    _default
  )(errObj);
}

function handleValidationError(errObj) {
  if (errObj.processed || errObj.name !== "ValidationError") {
    return errObj;
  } 

  return {
    errors: errObj.errors,
    processed: true,
    type: UserErrs.REGISISTRATION_ERR
  };
}

function _default(errObj) {
  if (errObj.processed) {
    return {
      type: errObj.type,
      errors: errObj.errors
    };
  }

  return {
    type: INTERNAL_ERR,
    errors: errObj
  };
}

module.exports = errorHanlder;