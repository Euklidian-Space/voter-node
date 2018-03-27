const User = require("../user");

exports.createUser = userObj => {
  const newUser = new User(userObj);

  return newUser.save(userObj);
};

exports.getUserByEmail = email => {
  return User.findOne({"email": email})
    .then(user => {
      if (user === null) {
        return Promise.reject("Email not found.");
      }

      return Promise.resolve(user);
    })
}