const { to } = require("await-to-js");
const { INVALID_ID, UserErrs } = require("src/errors/error_types");
const { listUsers, createUser, getUserByEmail, getUserById, comparePasswords } = require("src/contexts/accounts");
const { seedUsers, connectToTestDB, disconnectTestDB } = require("../helpers");
const User = require("src/models/user");
const insertTenUsers = seedUsers(10);
const bcrypt = require('bcryptjs');

let connection;
let db;

beforeAll(async () => {
  connection = await connectToTestDB(global.__MONGO_URI__);
  db = connection.db;
});

// afterAll(async () => {
//   await disconnectTestDB(connection, db);
// });

describe("Accounts context", () => {
  describe("createUser", () => {
    it("should insert a user in DB when valid", done => {
      const user = {
        name: "john",
        email: "john@example.com",
        password: "Password1234!"
      };

      createUser(user)
        .then(userObj => {
          expect(userObj).toMatchObject({
            name: "john",
            email: "john@example.com"
          });
          done();
        })
    });

    it("should return errors for invalid fields and not persist to DB", async () => {
      const user = {
        name: "john",
        email: "john@example2.com",
        password: "password"
      };
      const [errs, userReceived] = await to(createUser(user));
      const err_msg = errs.errors.password.message;

      expect(userReceived).toBeFalsy();
      expect(err_msg).toBe("Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character.");
      return expect(User.findOne({email: user.email})).resolves.toBeFalsy();
    });

    it("should return errors for each invalid field", async () => {
      const user = {
        name: "",
        email: "",
        password: "Password1234!"
      };

      const [errs, userReceived] = await to(createUser(user));
      const email_err = errs.errors.email.message;
      const name_err = errs.errors.name.message;
      const password_err = errs.errors.password;

      expect(userReceived).toBeFalsy();
      expect(password_err).toBeFalsy();
      expect(email_err).toBe("Path `email` is required.");
      return expect(name_err).toBe("Path `name` is required.");
    });
  });

  describe("getUserById", () => {
    it("should return user document for valid id", async () => {
      const [err, user] = await to(createUser({
        name: "charles",
        email: "charles@domain.com",
        password: "Password1234!"
      }));

      return expect(getUserById(user.id)).resolves.toMatchObject({
        name: "charles",
        email: "charles@domain.com",
        id: user.id
      });
    });

    it("should reject for invalid id", async () => {
      const id = "id123";
      return expect(getUserById(id)).rejects.toEqual({
        message: `'${id}' is not a valid id`,
        name: INVALID_ID
      });
    });

    it("should reject for an id that is not found", async () => {
      const id = "000000000000000000000000";
      const expected = {
        message: `No user found with id: '${id}'`,
        name: UserErrs.USER_NOT_FOUND_ERR
      };
      return expect(getUserById(id)).rejects.toEqual(expected);
    });

    it("should reject for a falsy id", async () => {
      const expected = {
        message: "'undefined' is not a valid id",
        name: INVALID_ID
      };

      return expect(getUserById(undefined)).rejects.toEqual(expected);
    });
  });

  describe("listUsers", () => {
    let _users;
    const intoDatabase = users => {
      _users = users;
      return Promise.all(users.map(u => createUser(u)));
    };    

    beforeEach(() => insertTenUsers(intoDatabase));

    it("should list all documents in users collection", async done => {
      const received_users = await listUsers();
      for (let expected_user of _users) {
        const found = received_users.find(ru => ru.email === expected_user.email);
        expect(found).toBeTruthy();
      }
      done();
    });
  });

  describe("getUserByEmail", () => {
    let _users;
    let email;
    const intoDatabase = users => {
      email = users[0].email;
      _users = users;
      return Promise.all(users.map(u => createUser(u)));
    };    

    beforeEach(() => insertTenUsers(intoDatabase));

    it("should return user document for found email", async () => {
      const expected_user = _users[0];
      const [_, received_user] = await to(getUserByEmail(email));
      const {name: received_name, email: received_email} = received_user;

      expect(received_email).toBe(expected_user.email);
      return expect(received_name).toBe(expected_user.name);
    });

    it("should reject with error if email is not found", async () => {
      const incorrect_email = "name@invalid.com";
      const [err, _] = await to(getUserByEmail(incorrect_email));
      return expect(err).toEqual({
        message: `No user found with email: '${incorrect_email}'`,
        name: UserErrs.USER_NOT_FOUND_ERR
      });
    });
  });

  describe("comparePasswords", () => {
    const pw = "passWord12341";
    const pw_hash = bcrypt.hashSync(pw, 1);
    it("should return [null, 'pass'] for matching passwords", () => {
      expect(comparePasswords(pw, pw_hash))
        .toEqual([null, "pass"]);
    });

    it("should reject with error for non matching password and hash", () => {
      const errObj = {
        message: "incorrect password",
        name: UserErrs.LOGIN_ERR
      };
      expect(comparePasswords("wrong pw", pw_hash))
        .toEqual([errObj, null]);
    });
  });

});




