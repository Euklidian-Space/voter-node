const { to } = require("await-to-js");
const { JWT_KEY } = require("config");
const jwt = require("jsonwebtoken");
const { AuthErrs } = require("../../errors/error_types");

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

//actions

exports.actions = repo => {
  const { 
    createUser, 
    getUserById, 
    getUserByEmail, 
    listUsers, 
    comparePasswords, 
    listUserPolls 
  } = repo;

  const create = async (req, res, next) => {
    const [err, user] = await to(createUser(req.body));
    if (err) return next(err);

    const respObj = {
      email: user.email,
      name: user.name,
      token: token(user.id, JWT_KEY, jwt)
    };

    res.status(200).send(respObj);
    return Promise.resolve(respObj);
  };

  const show = async (req, res, next) => {
    const { id } = req.params;  
    const [err, user] = await to(getUserById(id));
    if (err) return next(err);

    res.status(200).send(user);
    return Promise.resolve(user);
  };

  const index = async (req, res, next) => {
    const [err, users] = await to(listUsers());
    if (err) return next(err);

    res.status(200).send(users);
    return Promise.resolve(users);
  };

  const login = async (req, res, next) => {
    const {email, password} = req.body;
    const [err, user] = await to(getUserByEmail(email));
    if (err) return next(err);

    const [errObj, _] = comparePasswords(password, user.password);
    if (errObj) return next(errObj);

    const respObj = {
      id: user.id,
      email,
      token: token(user.id, JWT_KEY, jwt)
    };

    res.status(200).send(respObj);
    return Promise.resolve(respObj);
  };

  const getPolls = async (req, res, next) => {
    const { id } = req.params;
    const [err, polls] = await to(listUserPolls(id));
    if (err) return next(err);

    res.status(200).send({ polls });
    return Promise.resolve(polls);
  };

  return {
    create,
    show,
    index,
    login,
    getPolls
  };
};
