const { to } = require("await-to-js");
const jwt = require("jsonwebtoken");
const { last } = require("lodash/fp");
const { JWT_KEY } = require("config");
const bcrypt = require('bcryptjs');
const UserController = require("src/controllers/user_controller");
const { INVALID_ID, INTERNAL_ERR } = require("src/errors/error_types");
const { seedUsers, generateMongoIDs } = require("../helpers");
const generate10Users = () => seedUsers(10)(users => users);
const generateMongoID = () => generateMongoIDs(1)[0];


jest.mock("src/contexts/accounts", () => {
  return {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    listUsers: jest.fn(),
    getUserByEmail: jest.fn(),
    comparePasswords: jest.fn()
  };
});
const { createUser, getUserById, listUsers, getUserByEmail, comparePasswords } = require("src/contexts/accounts");
const { createUserMock, getUserByIdMock, listUsersMock, getUserByEmailMock, comparePasswordsMock } = require("../mocks/accounts_context_mock");

afterAll(jest.clearAllMocks);

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
    const resolvedUserMock = createUserMock(true);
    const createRejectedUserMockWithErr = createUserMock(false);
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
      createUser.mockImplementation(resolvedUserMock);
      const [_, {email, name, token}] = await to(UserController.create(req, res));
      const send_arg = last(sendSpy.mock.calls)[0];
      const expected_response = {
        email,
        name,
        token
      };

      return expect(send_arg).toEqual(expected_response);
    });  
    
    it("should call next with errObj", async () => {
      const errResp = {
        errors: {
          fieldA: {message: "msgA"},
          fieldB: {message: "msgB"}
        },
        name: "ValidationError"
      };

      createUser.mockImplementation(createRejectedUserMockWithErr(errResp));

      await UserController.create(req, res, next);

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
    const resolvedGetUserMock = getUserByIdMock(true);
    const rejectedGetUserMock = getUserByIdMock(false);
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
      getUserById.mockImplementation(resolvedGetUserMock(userObj));
      const [err, user] = await to(UserController.show(req, res));
      expect(err).toBeFalsy();
      expect(user).toMatchObject(userObj);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should call next with error object", async () => {
      const id = "111111111111111111111111";
      getUserById.mockImplementation(rejectedGetUserMock(INVALID_ID, id));
      req.params.id = id;
      await UserController.show(req, res, next);
      return expect(next).toHaveBeenCalledWith({
        message: `'${id}' is not a valid id`,
        name: INVALID_ID
      });
    });
  });

  describe("index", () => {
    const fakeUsers = generate10Users();
    const resolvedListUsersMock = listUsersMock(true);
    const rejectedListUserMock = listUsersMock(false);
    let next;
    beforeEach(() => {
      next = jest.fn();
    })

    it("should send a status of 200 and list of users", async () => {
      listUsers.mockImplementation(resolvedListUsersMock(fakeUsers));
      const [err, users] = await to(UserController.index(req, res));

      expect(err).toBeFalsy();
      expect(users).toEqual(fakeUsers);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith(users);
    });

    it("should call next with errObj", async () => {
      const expected_error = {
        message: "There was a problem fetching users",
        name: INTERNAL_ERR
      };
      listUsers.mockImplementation(rejectedListUserMock(expected_error));

      await UserController.index(req, res, next);
      return expect(next).toHaveBeenCalledWith(expected_error);
    });
  });

  describe("login", () => {
    const resolvedGetUserByEmailMock = getUserByEmailMock(true);
    const rejectedGetUserByEmailMock = getUserByEmailMock(false);
    const validComparePasswordsMock = comparePasswordsMock(true);
    const invalidComparePasswordsMock = comparePasswordsMock(false);
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
      getUserByEmail.mockImplementation(resolvedGetUserByEmailMock(users));
      comparePasswords.mockImplementation(validComparePasswordsMock);
      req.body = {
        email,
        password
      };
      next = jest.fn();
      done();
    });

    it("should should send 200 status and response object with user id and token", async () => {
      const [_, respObj] = await to(UserController.login(req, res));
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith(respObj);
    });

    it("should return a json web token that has the user id encoded", async () => {
      const [{id: expected_id}] = users;
      const [_, {token}] = await to(UserController.login(req, res));
      const { id: decoded_id } = jwt.verify(token, JWT_KEY);
      return expect(decoded_id).toEqual(expected_id.toString());
    });

    it("should call next with errObj for wrong password", async () => {
      comparePasswords.mockImplementation(invalidComparePasswordsMock);
      req.body = Object.assign(req.body, {password: "wrong password"});
      const expected_error = {
        message: "incorrect password", 
        name: "LoginError"
      };

      await to(UserController.login(req, res, next));
      return expect(next).toHaveBeenCalledWith(expected_error);
    });


    it("should call next with err object for an unknown email", async () => {
      const expected_error = {
        message: `No user found with email: 'unknown@email.com'`,
        name: "UserNotFoundError"
      };
      getUserByEmail.mockImplementation(rejectedGetUserByEmailMock("unknown@email.com"));
      req.body = Object.assign(req.body, {email: "unknown@email.com"});

      await to(UserController.login(req, res, next));

      return expect(next).toHaveBeenCalledWith(expected_error);
    });

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
});



