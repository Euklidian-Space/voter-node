const reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;

exports.passwordREGEX = reg;

exports.validatePassword = function(pw) {
  if (pw.length < 8) {
    return Promise.reject("Password must be atleast 8 characters.")
  } else if (!pw.match(reg)) {
    const msg = "Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character."; 
    return Promise.reject(msg);
  } else {
    return Promise.resolve(pw);
  }
};

exports.validatePasswordLength = pw => pw.length >= 8;

exports.validatePasswordFormat = pw => pw.match(reg);