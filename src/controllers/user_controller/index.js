const { to } = require("await-to-js");
const { createUser, getUserById, listUsers, getUserByEmail, comparePasswords } = require("../../contexts/accounts");
const { JWT_KEY } = require("config");
const jwt = require("jsonwebtoken");
const HandleErrors = require("src/errors/handler");

exports.create = async (req, res) => {
  const newUser = req.body;
  const [err, user] = await to(createUser(newUser));
  if (err) return HandleErrors(err, res);

  const respObj = {
    user,
    token: token(user.id, JWT_KEY, jwt)
  };

  res.status(200).send(respObj);
  return Promise.resolve(respObj);
};

exports.show = async (req, res) => {
  const { id } = req.params;  
  const [err, user] = await to(getUserById(id));
  if (err) return HandleErrors(err, res);

  res.status(200).send(user);
  return Promise.resolve(user);
};

exports.index = async (req, res) => {
  const [err, users] = await to(listUsers());
  if (err) return HandleErrors(err, res);

  res.status(200).send(users);
  return Promise.resolve(users);
};

exports.login = async (req, res) => {
  const {email, password} = req.body;
  const [err, user] = await to(getUserByEmail(email));
  if (err) return HandleErrors(err, res);

  const [errObj, _] = comparePasswords(password, user.passwordHash);
  if (errObj) return HandleErrors(errObj, res);

  const respObj = {
    user: user.id,
    token: token(user.id, JWT_KEY, jwt)
  };

  res.status(200).send(respObj);
  return Promise.resolve(respObj);
};

function token(id, key, tokenModule) {
  return tokenModule.sign({id}, key, {expiresIn: 86400});
}

