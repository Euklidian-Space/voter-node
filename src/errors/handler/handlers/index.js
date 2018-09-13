const { 
  UserErrs, 
  INVALID_ID, 
  VALIDATION_ERR, 
  PollErrs,
  AuthErrs
} = require("../../error_types");

exports.handleValidationError = function(errObj) {
  if (errObj.handled || errObj.name !== VALIDATION_ERR) {
    return errObj;
  } 
  const re = /Path\s/;
  const message = valueOf(errObj, "message").replace(re, "");

  const passedHandler = res => {
    res.status(400).send({message});
    return Promise.resolve({message});
  }

  return {
    ...errObj,
    passedHandler,
    handled: true
  };
}

exports.handleInvalidIdError = function(errObj) {
  if (errObj.handled || errObj.name !== INVALID_ID) {
    return errObj;
  } 

  const passedHandler = res => {
    const { message } = errObj;
    res.status(404).send({ message });
    return Promise.resolve(errObj);
  };

  return {
    ...errObj, 
    passedHandler,
    handled: true
  };
}

exports.handleUserNotFoundError = function(errObj) {
  if (errObj.handled || errObj.name !== UserErrs.USER_NOT_FOUND_ERR) {
    return errObj;
  } 

  const passedHandler = res => {
    const { message } = errObj;
    res.status(404).send({ message });
    return Promise.resolve(errObj);
  };

  return {
    ...errObj, 
    passedHandler,
    handled: true
  };
}

exports.handlePollNotFoundError = function(errObj) {
  if (errObj.handled || errObj.name !== PollErrs.POLL_NOT_FOUND_ERR) {
    return errObj;
  } 

  const passedHandler = res => {
    const { message } = errObj;
    res.status(404).send({ message });
    return Promise.resolve(errObj);
  };

  return {
    ...errObj,
    passedHandler,
    handled: true
  };
}

exports.handleLoginError = function(errObj) {
  if (errObj.handled || errObj.name !== UserErrs.LOGIN_ERR) {
    return errObj;
  }

  const passedHandler = res => {
    const { message } = errObj;
    res.status(404).send({ message });
    return Promise.resolve(errObj);
  };

  return {
    ...errObj,
    passedHandler,
    handled: true
  };
}

exports.authErrorHandler = function(errObj) {
  if (errObj.handled || errObj.name !== AuthErrs.AUTH_ERR) {
    return errObj;
  }

  const passedHandler = res => {
    const { message } = errObj;
    res.status(401).send({ message });
    return Promise.resolve(errObj);
  };

  return {
    ...errObj,
    passedHandler,
    handled: true
  };
}

function valueOf(obj, key) {
  const inner = (val)=> {
    if (Array.isArray(val) || typeof val !== "object")
      return null;
    for (let k in val) {
      if (k === key) return val[k];
      const _val = inner(val[k]);
      if (_val) return _val;
    }
  };
  const pathToKey = inner(obj, []);
  if (pathToKey) return pathToKey;
  throw new Error(`${key}: is not present in object: ${obj}`);
}