const { INVALID_ID, UserErrs } = require("src/errors/error_types");

exports.listUsersMock = isValid => {
  if (isValid) {
    return users => () => Promise.resolve(users);
  }

  return err => () => Promise.reject(err);
}

exports.getUserByIdMock = isValid => {
  if (!isValid) {
    return (errorType, id) => {
      if (errorType === INVALID_ID) 
        return () => Promise.reject({
          message: `'${id}' is not a valid id`,
          name: INVALID_ID
        });
      
      return () => Promise.reject({
        message: `No user found with id: '${id}'`,
        name: UserErrs.USER_NOT_FOUND_ERR
      });
    };
  }

  return userObj => () => Promise.resolve(userObj);
};  

exports.getUserByEmailMock = isResolved => {
  if (!isResolved) {
    return email => () => Promise.reject({
      message: `No user found with email: '${email}'`,
      name: UserErrs.USER_NOT_FOUND_ERR
    });
  }

  return users => email => {
    return Promise.resolve(users.find(u => u.email === email)); 
  };
}

exports.createUserMock = isValid => {
  if (isValid) {
    return userObj => Promise.resolve(userObj);
  }

  return errs => () => Promise.reject(errs);
}

exports.comparePasswordsMock = isValid => {
  const errObj = {
    message: "incorrect password",
    name: UserErrs.LOGIN_ERR
  };

  if (isValid) {
    return () => [null, "pass"];
  }

  return () => [errObj, null];
}







