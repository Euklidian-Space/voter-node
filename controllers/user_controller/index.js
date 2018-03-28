const { createUser } = require("../../contexts/accounts");

exports.create = (req, res) => {
  const newUser = req.body;
  return createUser(newUser);
};