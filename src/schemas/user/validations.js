const reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;

exports.passwordREGEX = reg;

exports.validatePasswordLength = pw => pw.length >= 8;

exports.validatePasswordFormat = pw => pw.match(reg);