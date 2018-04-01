const UserErrs = require("./user_errs");


exports.Errs = resource => {
  switch (resource) {
    case "users":
      return UserErrs;      
  
    default:
      throw "Invalid Resource"
  }
};

exports.composeErrs = (message, err) => {

};