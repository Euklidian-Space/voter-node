const UserErrs = require("./user_errs");
const PollErrs = require("./poll_errs");
const AuthErrs = require("./auth_errs");

module.exports = {
  INVALID_ID: "INVALID_ID_ERR",
  INTERNAL_ERR: "INTERNAL_ERR",
  VALIDATION_ERR: "ValidationError", 
  UserErrs,
  PollErrs,
  AuthErrs 
};