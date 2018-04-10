const { INVALID_ID, UserErrs } = require("../../errors/error_types");

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

exports.createUserMock = isValid => {
  if (isValid) {
    return userObj => Promise.resolve(userObj);
  }

  return errs => () => Promise.reject(errs);
}