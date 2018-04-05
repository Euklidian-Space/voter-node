const UserController = require("../../controllers/user_controller");
const { to } = require("await-to-js");
const { seedUsers } = require("../helpers");
const generate10Users = () => seedUsers(10)(users => users);

jest.mock("../../contexts/accounts", () => {
  return {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    listUsers: jest.fn()
  };
});
const { createUser, getUserById, listUsers } = require("../../contexts/accounts");
const { createUserMock, getUserByIdMock, listUsersMock } = require("../mocks/accounts_context_mock");

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

    // it("should ")
  });

  describe("Show", () => {
    const valid_id = "000000000000000000000000";
    const userObj = {
      id: valid_id,
      name: "Euler",
      email: "euler@domain.com",
      password: "Password1234!"
    };

    beforeEach(() => {
      req = {
        params: {
          id: valid_id
        }
      };
      getUserById.mockImplementation(id => {
        if (id === valid_id) {
          return Promise.resolve(userObj);
        }

        return Promise.reject("No user found by id: " + id);
      });
    });

    it("should send status of 200 for a valid id", async () => {
      [err, user] = await to(UserController.show(req, res));
      expect(err).toBeFalsy();
      expect(user).toMatchObject(userObj);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should send status 404 for invalid id", async () => {
      const id = "111111111111111111111111";
      req.params.id = id;
      [err, user] = await to(UserController.show(req, res));
      expect(err).toEqual({error: "No user found by id: " + id});
      expect(statusMock).toHaveBeenCalledWith(404);
      return expect(sendSpy).toHaveBeenCalledWith({error: "No user found by id: " + id});
    });
  });

  describe("index", () => {
    const fakeUsers = generate10Users();

    beforeEach(() => {
      listUsers.mockImplementation(() => {
        return Promise.resolve(fakeUsers);
      });
      res = {
        send: sendSpy,
        status: statusMock  
      };
    });

    it("should send a status of 200 and list of users", async () => {
      const [err, users] = await to(UserController.index(req, res));
      expect(err).toBeFalsy();
      expect(users).toEqual(fakeUsers);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith({
        users: fakeUsers
      });
    });

    it("should send a status of 400 and error message if an error occurrs", async () => {
      const expected_error = { error: "There was a problem fetching users" };
      listUsers.mockImplementation(() => {
        return Promise.reject("There was a problem fetching users");
      });

      [err, users] = await to(UserController.index(req, res));
      expect(users).toBeFalsy();
      expect(err).toEqual(expected_error);
      expect(statusMock).toHaveBeenCalledWith(500);
      return expect(sendSpy).toHaveBeenCalledWith(expected_error);
    });
  });
});