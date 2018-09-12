const User = require('src/models/user');
const { seedUsers, connectToTestDB, disconnectTestDB } = require("../helpers");

let connection;
let db;

beforeAll(async () => {
  connection = await connectToTestDB(global.__MONGO_URI__);
  db = connection.db;
});

// afterAll(async () => {
//   await disconnectTestDB(connection, db);
// });

describe("User Model", () => {
  const fields = ["name", "email", "password"];

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

  it("should not save passwords as plain text", async () => {
    const clear_password = "Password1234!";
    const user = new User({name: "john", email: "john@example.com", password: clear_password});
    const received_user = await user.save();
    expect(received_user).toBeDefined();
    return expect(received_user.password).not.toBe(clear_password);
  });

  it("should require a specific password format", done => {
    const user = new User({name: "john", email: "john@example.com", password: "Password1234"});
    user.validate(function({ errors }) {
      const { password: { message } } = errors;
      expect(message).toBe("Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character.");
      done();
    });
  });

  it("should require password to be 8 or more characters", done => {
    const user = new User({name: "john", email: "john@example.com", password: "a"});
    user.validate(err => {
      expect(err).toBeTruthy();
      expect(err.errors.password.message).toBe("Password must be atleast 8 characters.");
      done();
    });
  });
});
