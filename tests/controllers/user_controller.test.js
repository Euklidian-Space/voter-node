const mockery = require("mockery");
const { buildResp, createRequest } = require("../helpers");
const UserController = require("../../controllers/user_controller");
// jest.mock("../../contexts/accounts", () => {
//   return {
//     createuser: jest.fn().mockimplementation(userobj => promise.resolve(userobj))
//   };
// });
jest.mock("../../contexts/accounts", () => {
  return {
    createUser: jest.fn()
  };
});
const { createUser } = require("../../contexts/accounts");

describe("User Controller", () => {
  let req, res;

  describe("Create", () => {
    beforeEach(() => {
      res = buildResp();
      req = createRequest({
        method: "POST",
        url: "/users",
        body: {
          name: "bobby",
          email: "bobby@example.com",
          password: "Password1234!"
        }
      });
    });

    it("should return a user object when valid", () => {
      createUser.mockImplementation(userObj => Promise.resolve(userObj));

      return UserController.create(req, res)
        .then(user => {
          console.log(user);
        }).catch(err => {
          console.log(err)
        });
    });  
  });
});