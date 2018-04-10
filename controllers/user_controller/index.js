const { to } = require("await-to-js");
const { flow } = require("lodash/fp");
const { createUser, getUserById, listUsers } = require("../../contexts/accounts");
const HandleErrors = require("../../errors/handler");

exports.create = async (req, res) => {
  const newUser = req.body;
  const [errs, user] = await to(createUser(newUser));

  if (!errs) {
    res.status(200).send(user);
    return Promise.resolve(user);
  } 

  return HandleErrors(errs, res);
};

exports.show = async (req, res) => {
  const { id } = req.params;  
  const [errs, user] = await to(getUserById(id));

  if (!errs) {
    res.status(200).send(user);
    return Promise.resolve(user);
  }

  return HandleErrors(errs, res);
};

exports.index = async (req, res) => {
  const [errs, users] = await to(listUsers());
  if (!errs) {
    res.status(200).send(users);
    return Promise.resolve(users);
  }

  return HandleErrors(errs, res);
};
