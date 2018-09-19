const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("config");
const AuthController = require("src/controllers/auth_controller");

describe("AuthController", () => {
  let req, res, sendSpy, statusMock;
  beforeEach(() => {
    sendSpy = jest.fn();
    statusMock = jest.fn().mockImplementation(code => res);
    res = {
      send: sendSpy,
      status: statusMock
    };
  });
  describe("verifyToken", () => {
    const user = {
      id: "some_id_1234",
      email: "name@example.com",
      name: "john",
      polls: []
    };
    const next = jest.fn();
    let token = jwt.sign({id: user.id}, JWT_KEY);
    beforeEach(() => {
      req = {
        headers: {
          'x-access-token': token
        }
      };
    });

    it("should call provided next function", () => {
      AuthController.verifyToken(req, res, next);
      return expect(next).toHaveBeenCalled();
    });

    it("should assign token and userID to request object", () => {
      AuthController.verifyToken(req, res, next);
      expect(req.token).toBe(token);
      return expect(req.userID).toBe(user.id);
    });

    it("should not call next() for invalid token", () => {
      token = jwt.sign({id: user.id}, "some wrong secret key");
      req = {
        headers: {
          'x-access-token': token
        }
      };
      AuthController.verifyToken(req, res, next);
      return expect(next).toHaveBeenCalledWith({
        message: "Token authentication failure",
        name: "Auth_Error"
      });
    });
  });
});
