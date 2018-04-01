const { listUsers, createUser, getUserByEmail, getUserById } = require("../../contexts/accounts");
const { connectToTestDB, disconnectAndClearTestDB, seedUsers } = require("../helpers");
const { to } = require("await-to-js");
const { flow, map } = require("lodash/fp")
const insertTenUsers = seedUsers(10);

let db;

beforeEach(() => {
  return connectToTestDB()
    .then(dbInstance => {
      db = dbInstance;
    }).catch(err => console.log(err));
});

afterEach(() => {
  return disconnectAndClearTestDB(db, "users")
    .then(() => db = null)
    .catch(err => console.log(err));
});

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
        email: "john@example.com",
        password: "password"
      };

      const [errs, userReceived] = await to(createUser(user));
      const err_msg = errs.errors.passwordHash.message;

      expect(userReceived).toBeFalsy();
      expect(err_msg).toBe("Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character.");
      return expect(getUserByEmail("john@example.com")).rejects.toBe("Email not found.");
      
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
      const password_err = errs.errors.passwordHash;

      expect(userReceived).toBeFalsy();
      expect(password_err).toBeFalsy();
      expect(email_err).toBe("Path `email` is required.");
      return expect(name_err).toBe("Path `name` is required.");
    });
  });

  describe("getUserByEmail", () => {
    it("should return user document for a found email", done => {
      let _id;
      createUser({
        name: "john",
        email: "john@cool.com",
        password: "Password1234!"
      }).then(({ id }) => {
        getUserByEmail("john@cool.com")
          .then(user => {
            expect(user).toMatchObject({
              name: "john",
              id: id
            });
            done();
          });
      });
    });

    it("should reject for email not found with message", done => {
      expect(getUserByEmail("some email not in db")).rejects.toBe("Email not found.");
      done();
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
      return expect(getUserById("invalid_Id")).rejects.toBe("Invalid id");
    });

    it("should reject for an id that is not found", async () => {
      const id = "000000000000000000000000";
      return expect(getUserById(id)).rejects.toBe(`No user found by id: ${id}`);
    });
  });

  describe("listUsers", () => {
    const intoDatabase = users => {
      const promises = map(user => async () => createUser(user));
      const promise_calls = map(promise => promise());
      const saveToDb = flow(
        promises,
        promise_calls
      );
      return Promise.all(saveToDb(users));
    };    

    beforeEach(() => insertTenUsers(intoDatabase));

    it("should list all documents in users collection", async () => {
      return expect(listUsers()).resolves
        .toHaveLength(10);
    });
  });

});