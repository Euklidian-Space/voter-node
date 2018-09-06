const User = require('src/models/user');

describe("User Model", () => {
  const fields = ["name", "email", "passwordHash"];

  it("should require a name, email, and passwordHash", done => {
    const user = new User();
    user.validate(err => {
      expect(err).toBeTruthy()
      for (const field of fields) {
        expect(err.errors[field]).toBeDefined();
      }
    });
    done();
  });

  it("should not save passwords as plain text", done => {
    const user = new User({name: "john", email: "john@example.com", password: "Password1234!"});
    user.validate(function(err) {
      expect(err).toBeFalsy();
      expect(user.passwordHash).not.toBe("Password1234!");
    });
    done();
  });

  it("should require a specific password format", done => {
    const user = new User({name: "john", email: "john@example.com", password: "Password1234"});
    user.validate(function({ errors }) {
      const { passwordHash: { message } } = errors;
      expect(message).toBe("Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character.");
    });
    done();
  });
});
