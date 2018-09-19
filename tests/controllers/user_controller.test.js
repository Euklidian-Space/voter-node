const { to } = require("await-to-js");
const jwt = require("jsonwebtoken");
const { last } = require("lodash/fp");
const { JWT_KEY } = require("config");
const bcrypt = require('bcryptjs');
const UserController = require("src/controllers/user_controller");
const { INVALID_ID, INTERNAL_ERR } = require("src/errors/error_types");
const { seedUsers, generateMongoIDs, createFakePolls } = require("../helpers");
const generate10Users = () => seedUsers(10)(users => users);
const generateMongoID = () => generateMongoIDs(1)[0];

describe("User Controller", () => {
  let req, res, sendSpy, statusMock;
  beforeEach(() => {
    sendSpy = jest.fn();
    statusMock = jest.fn().mockImplementation(code => res);
    res = {
      send: sendSpy,
      status: statusMock
    };
  });

  describe("Create", () => {
    let next;
    beforeEach(() => {
      req = {
        body: {
          name: "bobby",
          email: "bobby@example.com",
          password: "Password1234!"
        }
      };
      next = jest.fn();
    });

    it("should send status 200 and user data in response object", async () => {
      const repo = {
        createUser: jest.fn().mockResolvedValue(req.body)
      };
      const { create } = UserController.actions(repo);
      await to(create(req, res));
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: req.body.email,
          name: req.body.name,
          token: expect.anything()
        })
      );
    });  
    
    it("should call next with errObj", async () => {
      const errResp = {
        errors: {
          fieldA: {message: "msgA"},
          fieldB: {message: "msgB"}
        },
        name: "ValidationError"
      };

      const repo = {
        createUser: jest.fn().mockRejectedValue(errResp)
      };
      const { create } = UserController.actions(repo);

      await create(req, res, next);

      return expect(next).toHaveBeenCalledWith(expect.objectContaining(errResp));
    });
  });

  describe("Show", () => {
    const valid_id = "000000000000000000000000";
    const userObj = {
      id: valid_id,
      name: "Euler",
      email: "euler@domain.com",
      password: "Password1234!"
    };
    let next;

    beforeEach(() => {
      req = {
        params: {
          id: valid_id
        }
      };
      next = jest.fn();
    });

    it("should send status of 200 for a valid id", async () => {
      const repo = {
        getUserById: jest.fn().mockResolvedValue(userObj)
      }
      const { show } = UserController.actions(repo);
      await show(req, res);
      expect(sendSpy).toHaveBeenCalledWith(userObj);
      return expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should call next with error object", async () => {
      const id = "111111111111111111111111";
      req.params.id = id;
      const repo = {
        getUserById: jest.fn().mockRejectedValue({message: "error"})
      };
      const { show } = UserController.actions(repo);
      await show(req, res, next);
      return expect(next).toHaveBeenCalledWith({
        message: "error"
      });
    });
  });

  describe("index", () => {
    let next;
    beforeEach(() => {
      next = jest.fn();
    })

    it("should send a status of 200 and list of users", async () => {
      const repo = {
        listUsers: jest.fn().mockResolvedValue("some value")
      };
      const { index } = UserController.actions(repo);
      await index(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith("some value");
    });

    it("should call next with errObj", async () => {
      const expected_error = {
        message: "some error message"
      };
      const repo = {
        listUsers: jest.fn().mockRejectedValue(expected_error)
      };
      const { index } = UserController.actions(repo);

      await index(req, res, next);
      return expect(next).toHaveBeenCalledWith(expected_error);
    });
  });

  describe("login", () => {
    let password, email, next;
    const hashPasswords = users => {
      correct_password = users[0].password;
      email = users[0].email;
      return users.map(u => {
        const password = bcrypt.hashSync(u.password, 1);
        return {
          name: u.name,
          email: u.email,
          id: generateMongoID(),
          password
        };
      });
    }
    const users = hashPasswords(generate10Users());

    beforeEach(async done => {
      req.body = {
        email,
        password
      };
      next = jest.fn();
      done();
    });

    it("should should send 200 status and response object with user id and token", async () => {
      const repo = {
        getUserByEmail: jest.fn().mockResolvedValue({
          id: "1234",
          password
        }),
        comparePasswords: jest.fn().mockImplementation(() => [null, "pass"])
      };
      const { login } = UserController.actions(repo);
      await login(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1234",
          email,
          token: expect.anything()
        })
      );
    });

    it("should call next with errObj for wrong password", async () => {
      const expected_error = {
        message: "incorrect password", 
        name: "LoginError"
      };

      const repo = {
        getUserByEmail: jest.fn().mockResolvedValue({
          id: "1234",
          password
        }),
        comparePasswords: jest.fn().mockImplementation(() => [expected_error, null])
      };

      const { login } = UserController.actions(repo);

      await login(req, res, next);
      return expect(next).toHaveBeenCalledWith(expected_error);
    });


    it("should call next with err object for an unknown email", async () => {
      const expected_error = {
        message: `No user found with email: 'unknown@email.com'`,
        name: "UserNotFoundError"
      };

      const repo = {
        getUserByEmail: jest.fn().mockRejectedValue(expected_error),
        comparePasswords: jest.fn()
      };

      const { login } = UserController.actions(repo);

      await login(req, res, next)

      return expect(next).toHaveBeenCalledWith(expected_error);
    });

  });

  xdescribe("verifyToken", () => {
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
      UserController.verifyToken(req, res, next);
      return expect(next).toHaveBeenCalled();
    });

    it("should assign token and userID to request object", () => {
      UserController.verifyToken(req, res, next);
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
      UserController.verifyToken(req, res, next);
      return expect(next).toHaveBeenCalledWith({
        message: "Token authentication failure",
        name: "Auth_Error"
      });
    });
  });

  describe("getPolls", () => {
    const fakePolls = createFakePolls(4);
    const { user } = fakePolls[0];

    beforeEach(() => {
      req.params = {
        id: user
      };
    })

    it("should call listUserPolls from CMS context", async () => {
      const repo = {
        listUserPolls: jest.fn().mockResolvedValue({polls: fakePolls})
      };

      const { getPolls } = UserController.actions(repo);
      await getPolls(req, res);
      return expect(repo.listUserPolls).toHaveBeenCalled()
    });

    it("should send 200 status and return polls associated with given user", async () => {
      const polls = [fakePolls[0]];
      const expected = {
        polls
      };
      const repo = {
        listUserPolls: jest.fn().mockResolvedValue(polls)
      };
      const { getPolls } = UserController.actions(repo);
      await getPolls(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith(expected);
    });

    it("should call next with error object", async () => {
      const next = jest.fn();
      const errObj = {
        name: INVALID_ID,
        message: "some message"
      };
      const repo = {
        listUserPolls: jest.fn().mockRejectedValue(errObj)
      };
      const { getPolls } = UserController.actions(repo);

      await getPolls(req, res, next);
      return expect(next).toHaveBeenCalledWith(errObj);
    });
  });
});



