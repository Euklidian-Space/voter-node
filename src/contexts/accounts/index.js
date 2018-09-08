const User = require("../../models/user");
const { UserErrs, INVALID_ID } = require("../../errors/error_types");
const { to } = require("await-to-js");
const bcrypt = require('bcryptjs');

exports.createUser = async userObj => {
  const newUser = new User(userObj);
  const [errs, user] = await to(newUser.save());
  if (errs) {
    return Promise.reject(errs);
  } 

  return Promise.resolve(user);
};

exports.getUserById = async id => {
  if (!id || !id.match(/^[0-9a-f]{24}$/i)) 
    return Promise.reject({
      message: `'${id}' is not a valid id`,
      name: INVALID_ID
    });

  const [err, user] = await to(User.findById(id));

  if (err) {
    return Promise.reject(err);
  } else if (user) {
    return Promise.resolve(user);
  } else {
    return Promise.reject({
      message: `No user found with id: '${id}'`,
      name: UserErrs.USER_NOT_FOUND_ERR
    });
  }
};

exports.getUserByEmail = async email => {
  const [err, [user]] = await to(User.find({ email }));

  if (err) {
    return Promise.reject(err);
  } else if (!user) {
    return Promise.reject({
      message: `No user found with email: '${email}'`,
      name: UserErrs.USER_NOT_FOUND_ERR
    });
  }

  return Promise.resolve(user);
};

exports.listUsers = async () => {
  return User.find({});
};

exports.comparePasswords = (password, hash) => {
  const errObj = {
    message: "incorrect password",
    name: UserErrs.LOGIN_ERR
  };

  if (!bcrypt.compareSync(password, hash)) {
    return [errObj, null];
  } 

  return [null, "pass"];
};





