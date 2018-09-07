const { to } = require("await-to-js");
const { createUser, getUserById, listUsers, getUserByEmail, comparePasswords } = require("../../contexts/accounts");
const { JWT_KEY } = require("config");
const jwt = require("jsonwebtoken");
const { AuthErrs } = require("../../errors/error_types");

exports.create = async (req, res, next) => {
  const newUser = req.body;
  const [err, user] = await to(createUser(newUser));
  if (err) return next(err);

  const respObj = {
    user,
    token: token(user.id, JWT_KEY, jwt)
  };

  res.status(200).send(respObj);
  return Promise.resolve(respObj);
};

exports.show = async (req, res, next) => {
  const { id } = req.params;  
  const [err, user] = await to(getUserById(id));
  if (err) return next(err);

  res.status(200).send(user);
  return Promise.resolve(user);
};

exports.index = async (req, res, next) => {
  const [err, users] = await to(listUsers());
  if (err) return next(err);

  res.status(200).send(users);
  return Promise.resolve(users);
};

exports.login = async (req, res, next) => {
  const {email, password} = req.body;
  const [err, user] = await to(getUserByEmail(email));
  if (err) return next(err);

  const [errObj, _] = comparePasswords(password, user.passwordHash);
  if (errObj) return next(errObj);

  const respObj = {
    user: user.id,
    token: token(user.id, JWT_KEY, jwt)
  };

  res.status(200).send(respObj);
  return Promise.resolve(respObj);
};

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

function token(id, key, tokenModule) {
  return tokenModule.sign({id}, key, {expiresIn: 86400});
}

