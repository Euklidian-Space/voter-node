const { UserErrs, INVALID_ID } = require("../../error_types");

function handleValidationError(errObj) {
  if (errObj.handled || errObj.name !== UserErrs.VALIDATION_ERR) {
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
    handled: true
  };
}

function handleInvalidIdError(errObj) {
  if (errObj.handled || errObj.name !== INVALID_ID) {
    return errObj;
  } 

  const passedHandler = res => {
    const { message } = errObj;
    res.status(404).send({ message });
    return Promise.reject(errObj);
  };

  return {
    ...errObj, 
    passedHandler,
    handled: true
  };
}

function handleUserNotFoundErr(errObj) {
  if (errObj.handled || errObj.name !== UserErrs.USER_NOT_FOUND_ERR) {
    return errObj;
  } 

  const passedHandler = res => {
    const { message } = errObj
    res.status(404).send({ message });
    return Promise.reject(errObj);
  };

  return {
    ...errObj, 
    passedHandler,
    handled: true
  };
}

module.exports = {
  handleValidationError,
  handleInvalidIdError,
  handleUserNotFoundErr
};
