const { to } = require("await-to-js");
const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("../../config");
const bcrypt = require('bcryptjs');
const UserController = require("../../controllers/user_controller");
const { INVALID_ID, INTERNAL_ERR} = require("../../errors/error_types");
const { seedUsers, generateMongoIDs } = require("../helpers");
const generate10Users = () => seedUsers(10)(users => users);
const generateMongoID = () => generateMongoIDs(1)[0];

jest.mock("../../contexts/accounts", () => {
  return {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    listUsers: jest.fn(),
    getUserByEmail: jest.fn()
  };
});
const { createUser, getUserById, listUsers, getUserByEmail } = require("../../contexts/accounts");
const { createUserMock, getUserByIdMock, listUsersMock, getUserByEmailMock } = require("../mocks/accounts_context_mock");

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
    beforeEach(() => {
      req = {
        body: {
          name: "bobby",
          email: "bobby@example.com",
          password: "Password1234!"
        }
      };
    });

    it("should send status 200 and user data in response object", () => {
      createUser.mockImplementation(resolvedUserMock);
      return UserController.create(req, res)
        .then(() => {
          expect(statusMock).toHaveBeenCalledWith(200);
          expect(sendSpy).toBeCalledWith(req.body);
        });
    });  
    
    it("should send status 404 and error message when there is a ValidationError", async () => {
      const errResp = {
        errors: {
          fieldA: {message: "msgA"},
          fieldB: {message: "msgB"}
        },
        name: "ValidationError"
      };

      createUser.mockImplementation(createRejectedUserMockWithErr(errResp));

      const [errs, _] =  await to(UserController.create(req, res));

      expect(errs).toEqual(errResp.errors);
      expect(statusMock).toHaveBeenCalledWith(404);
      return expect(sendSpy).toHaveBeenCalledWith(errResp.errors);
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

    beforeEach(() => {
      req = {
        params: {
          id: valid_id
        }
      };
    });

    it("should send status of 200 for a valid id", async () => {
      getUserById.mockImplementation(resolvedGetUserMock(userObj));
      const [err, user] = await to(UserController.show(req, res));
      expect(err).toBeFalsy();
      expect(user).toMatchObject(userObj);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should send status 404 for invalid id", async () => {
      const id = "111111111111111111111111";
      getUserById.mockImplementation(rejectedGetUserMock(INVALID_ID, id));
      req.params.id = id;
      [err, user] = await to(UserController.show(req, res));
      expect(err).toEqual({
        message: `'${id}' is not a valid id`,
        name: INVALID_ID
      });
      expect(statusMock).toHaveBeenCalledWith(404);
      return expect(sendSpy).toHaveBeenCalledWith({ message: `'${id}' is not a valid id` });
    });
  });

  describe("index", () => {
    const fakeUsers = generate10Users();
    const resolvedListUsersMock = listUsersMock(true);
    const rejectedListUserMock = listUsersMock(false);

    it("should send a status of 200 and list of users", async () => {
      listUsers.mockImplementation(resolvedListUsersMock(fakeUsers));
      const [err, users] = await to(UserController.index(req, res));

      expect(err).toBeFalsy();
      expect(users).toEqual(fakeUsers);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith(users);
    });

    it("should send a status of 400 and error message if an error occurrs", async () => {
      const expected_error = {
        message: "There was a problem fetching users",
        name: INTERNAL_ERR
      };
      listUsers.mockImplementation(rejectedListUserMock(expected_error));

      const [err, users] = await to(UserController.index(req, res));
      expect(users).toBeFalsy();
      expect(err).toEqual(expected_error);
      expect(statusMock).toHaveBeenCalledWith(500);
      return expect(sendSpy).toHaveBeenCalledWith(expected_error);
    });
  });

  describe("login", () => {
    const resolvedGetUserByEmailMock = getUserByEmailMock(true);
    const rejectedGetUserByEmailMock = getUserByEmailMock(false);
    let password;
    let email;
    const hashPasswords = users => {
      correct_password = users[0].password;
      email = users[0].email;
      return users.map(u => {
        const passwordHash = bcrypt.hashSync(u.password, 1);
        return {
          name: u.name,
          email: u.email,
          id: generateMongoID(),
          passwordHash
        };
      });
    }
    const users = hashPasswords(generate10Users());

    beforeEach(async done => {
      getUserByEmail.mockImplementation(resolvedGetUserByEmailMock(users));
      req.body = {
        email,
        password
      };
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

    xit("should send 404 status and reject with err object for wrong password", async () => {
      req.body = Object.assign(req.body, {password: "wrong password"});
      const expected_error = {
        message: "incorrect email or password", 
        name: "LoginError"
      };
      const [err, _] = await to(UserController.login(req, res));

      return expect(err).toEqual(expected_error);
    });

  });
});



