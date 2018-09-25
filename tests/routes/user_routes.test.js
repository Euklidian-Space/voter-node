const request = require("supertest");
const app = require("../../app");
const { populateUsers, populatePolls } = require("../helpers");
const { head } = require("lodash/fp");
let users, password;

beforeAll(async done => {
  users = await populateUsers(10);
  polls = await populatePolls(users);
  password = "pAssword1234!";
  done();
});

describe("Users api routes", () => {
  describe("GET /user/:id", () => {
    it("does not send user if not logged in", () => {
      const id = users[0]._id;
      const expected_resp_body = {
        message: 'Token authentication failure'
      };
      return request(app)
        .get(`/user/${id}`)
        .expect(401)
        .then(response => {
          expect(response.body).toEqual(expected_resp_body);
        });
    });

    it("Sends requested user when they exist", () => {
      const id = users[0]._id;
      return request(app)
        .get(`/user/${id}`)
        .set("x-access-token", head(users).token)
        .expect(200)
        .then(res => {
          const {email} = res.body;
          expect(email).toBe(head(users).email);
        });
    });

    it("sends error object when user is not found", () => {
      const id = "111111111111111111111111";
      const expected_resp_body = {
        message: `No user found with id: '${id}'`
      };

      return request(app)
        .get(`/user/${id}`)
        .set("x-access-token", head(users).token)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expected_resp_body);
        });
    });
  });

  describe("POST /user/register", () => {
    let request_body;
    beforeEach(() => {
      request_body = {
        email: "john@example.com",
        name: "johnny5",
        password: "Secret1234!"
      };
    });

    it("should send new user id and jwt", () => {
      return request(app)
        .post("/user/register")
        .send(request_body)
        .expect(200)
        .then((res) => {
          const { body } = res;
          expect(body.name).toBe("johnny5");
          return expect(body.token).toBeDefined();
        });
    });

    it("should send error message", () => {
      request_body.password = "aaaaaaaaaaaaaaaaaaa"
      const expected_msg = "Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character.";
      return request(app)
        .post("/user/register")
        .send(request_body)
        .expect(400)
        .then(res => {
          const {body} = res;
          return expect(body.message).toBe(expected_msg);
        });
    });
  });

  describe("POST /user/login", () => {
    let request_body, user;
    beforeEach(() => {
      user = head(users);
      request_body = {
        email: user.email,
        password
      };
    });

    it("should respond with token and email", () => {
      return request(app)
        .post("/user/login")
        .send(request_body)
        .expect(200)
        .then(res => {
          const { body } = res;
          expect(body.token).toBeTruthy();
          expect(body.id).toBe(user._id.toString());
          return expect(body.email).toBe(user.email)
        });
    });

    it("should respond with an error message", () => {
      request_body.password = "Password1234";
      return request(app)
        .post("/user/login")
        .send(request_body)
        .expect(401)
        .then(({ body }) => {
          return expect(body.message).toBe("incorrect password");
        });
    });
  });

  describe("GET /user/:id/polls", () => {
    it("should send error message for invalid token in header", () => {
      const id = head(users)._id;
      const expected_resp_body = {
        message: 'Token authentication failure'
      };
      return request(app)
        .get(`/user/${id}/polls`)
        .expect(401)
        .then(({ body }) => {
          return expect(body).toEqual(expected_resp_body); 
        });
    });

    it("should send polls of associated user id", () => {
      const id = head(users)._id.toString();
      const expected_poll_ids = polls.filter(p => p.user.equals(id))
        .map(p => p._id.toString());

      return request(app)
        .get(`/user/${id}/polls`)
        .set("x-access-token", users[0].token)
        .expect(200)
        .then(({ body }) => {
          const received_poll_ids = body.polls.map(p => p._id);
          return expect(received_poll_ids).toEqual(expected_poll_ids);
        });
    });
  });
});
