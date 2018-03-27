const { createUser } = require("../../models/accounts");

exports.create = (req, res) => {
  const newUser = req.body;
  return createUser(newUser);
};