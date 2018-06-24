const { to } = require("await-to-js");
const { flow } = require("lodash/fp");
const { createUser, getUserById, listUsers } = require("../../contexts/accounts");
const HandleErrors = require("../../errors/handler");

exports.create = async (req, res) => {
  const newUser = req.body;
  const [err, user] = await to(createUser(newUser));
  if (err) return HandleErrors(err, res);

  res.status(200).send(user);
  return Promise.resolve(user);
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
