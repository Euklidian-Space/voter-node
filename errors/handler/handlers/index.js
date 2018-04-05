const { UserErrs, INVALID_ID } = require("../../error_types");

function handleValidationError(errObj) {
  if (errObj.processed || errObj.name !== UserErrs.VALIDATION_ERR) {
    return errObj;
  } 

  const { errors } = errObj;

  const passedHandler = res => {
    res.status(404).send(errors);
    return Promise.reject(errors);
  }

  return {
    ...errObj,
    passedHandler,
    processed: true
  };
}

function handleInvalidIdError(errObj) {
  if (errObj.processed || errObj.name !== INVALID_ID) {
    return errObj;
  } 

  const passedHandler = res => {
    res.status(404).send(errObj);
    return Promise.reject(errObj);
  };

  return {
    ...errObj, 
    passedHandler,
    processed: true
  };
}

function handleUserNotFoundErr(errObj) {
  if (errObj.processed || errObj.name !== UserErrs.USER_NOT_FOUND_ERR) {
    return errObj;
  } 

  const passedHandler = res => {
    res.status(404).send(errObj);
    return Promise.reject(errObj);
  };

  return {
    ...errObj, 
    passedHandler,
    processed: true
  };
}

// module.exports = {
//   handleValidationError,
//   handleInvalidIdError,
//   handleUserNotFoundErr
// };

module.exports = {
  handleValidationError
};