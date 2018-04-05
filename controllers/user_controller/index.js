const { to } = require("await-to-js");
const { flow } = require("lodash/fp");
const { createUser, getUserById, listUsers } = require("../../contexts/accounts");
const ErrorHandler = require("../../errors/handler");

exports.create = async (req, res) => {
  const newUser = req.body;
  const [errs, user] = await to(createUser(newUser));

  if (!errs) {
    res.status(200).send(user);
    return Promise.resolve(user);
  } 

  return ErrorHandler(errs, res);
};

exports.show = async (req, res) => {
  const { id } = req.params;  
  const [errs, user] = await to(getUserById(id));

  if (!errs) {
    res.status(200).send(user);
    return Promise.resolve(user);
  }

  res.status(404).send({error: errs});
  return Promise.reject({error: errs});
};

exports.index = async (req, res) => {
  const [error, users] = await to(listUsers());
  if (error) {
    res.status(500).send({ error });
    return Promise.reject({ error });
  }  
  res.status(200).send({users});
  return Promise.resolve(users);
};
