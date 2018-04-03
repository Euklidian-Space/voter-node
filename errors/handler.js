const { INTERNAL_ERR, UserErrs } = require("./error_types");

function errorHanlder(errObj) {
  switch (errObj.type) {
    case UserErrs.REGISISTRATION_ERR:
      
      break;
  
    default:
      break;
  }
}

module.exports = errorHanlder;