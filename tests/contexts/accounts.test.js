const { createUser, getUserByEmail } = require("../../models/accounts");
const { connectToTestDB, disconnectAndClearTestDB } = require("../helpers");

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

    it("should return errors for invalid fields and not persist to DB", done => {
      const user = {
        name: "john",
        email: "john@example.com",
        password: "password"
      };

      createUser(user)
        .catch(({ errors }) => {
          const message = errors.passwordHash.message; 
          expect(message).toBe("Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character.")
          expect(getUserByEmail("john@example.com")).rejects.toBe("Email not found.");
          done();
        });
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
});