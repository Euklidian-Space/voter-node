exports.listUsersMock = (isValid, users) => {
  if (isValid) {
    return () => Promise.resolve({ users });
  }

  return err => () => Promise.reject({error: err});
}

exports.getUserByIdMock = (isValid, user) => {
  if (!isValid) {
    return err => () => Promise.reject({error: err});
  } else if (user) {
    return () => Promise.resolve(user);
  }

  return () => Promise.reject({error: {message: `No user found by id: ${user.id}`}});
};  

exports.getUserByEmailMock = (isValid, user) => {
  if (!isValid) {
    return err => () => Promise.reject({error: err});
  } else if (user) {
    return () => Promise.resolve(user);
  }

  return () => Promise.reject({error: {message: `No user found by email: ${user.email}`}});
};

exports.createUserMock = isValid => {
  if (isValid) {
    return userObj => Promise.resolve(userObj);
  }

  return errs => () => Promise.reject(errs);
}