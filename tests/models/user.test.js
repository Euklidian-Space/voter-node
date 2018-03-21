const User = require('../../models/user');

describe("User Model", () => {
  const fields = ["name", "email", "passwordHash"];

  it("should require a name, email, and password", done => {
    const user = new User();
    user.validate(err => {
      expect(err).to.exist;
      for (const field of fields) {
        expect(err.errors[field]).to.exist;
      }
    });
    done();
  });

  it("should not save passwords as plain test", done => {
    const user = new User({name: "john", email: "john@example.com", password: "password1234"});
    console.log(user);
    user.validate(({errors}) => {
      expect(errors).to.not.exist
    });
    done();
  });
});
