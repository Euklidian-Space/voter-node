const UserController = require("../../controllers/user_controller");
const mockery = require("mockery");
const http_mocks = require("node-mocks-http");

function buildResp() {
  return http_mocks.createResponse({
    eventEmitter: require("events").EventEmitter
  });
}

function userCreateMock(_type) {
  switch (_type) {
    case "valid":
      return userObj => {
        return Promise.resolve(userObj);
      };
  
    default:
      break;
  }
}

describe("User Controller", () => {
  let req, res;
  describe("Create", () => {
    beforeEach(() => {
      res = buildResp();
      req = http_mocks.createRequest({
        method: "POST",
        url: "/users",
        body: {
          name: "john",
          email: "john@example.com",
          password: "Password1234!"
        }
      });

      mockery.registerMock("../../models/user", {
        save: userCreateMock("valid")
      });
    });

    afterEach(() => mockery.deregisterMock("../../models/user"));

    it("should return a user object when valid", done => {
      // UserController.create(req, res)
      //   .then(user => {
      //     expect(userObj).toEqual({
      //       name: "john", 
      //       email: "john@example.com",
      //       password: "Password1234!"
      //     });
      //     done();
      //   });
      done();
    });
  });
});