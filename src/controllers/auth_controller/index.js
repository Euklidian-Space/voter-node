const { JWT_KEY } = require("config");
const jwt = require("jsonwebtoken");
const { AuthErrs } = require("src/errors/error_types");

exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  jwt.verify(token, JWT_KEY, (err, decoded) => {
    if (err) {
      return next({
        message: "Token authentication failure",
        name: AuthErrs.AUTH_ERR
      });
    }
    req.token = token;
    req.userID = decoded.id;
    next();
  });
};

exports.token = (id) => {
  return jwt.sign({id}, JWT_KEY, {expiresIn: 86400});
}