const request = require("supertest");
const app = require("../../app");
const { populateUsers } = require("../helpers");
let users;

beforeAll(async done => {
  users = await populateUsers(10);
  done();
});

describe("Users api routes", () => {
  describe("GET /users/:id", () => {
    it("does not send user if not logged in", () => {
      const id = users[0]._id;
      const expected_resp_body = {
        message: 'Token authentication failure'
      };
      return request(app)
        .get(`/users/${id}`)
        .expect(401)
        .then(response => {
          expect(response.body).toEqual(expected_resp_body);
        });
    });

    it("Sends requested user when they exist", () => {
      const id = users[0]._id;
      return request(app)
        .get(`/users/${id}`)
        .set("x-access-token", users[0].token)
        .expect(200)
        .then(res => {
          const {email} = res.body;
          expect(email).toBe(users[0].email);
        });
    });

    it("sends error object when user is not found", () => {
      const id = "111111111111111111111111";
      const expected_resp_body = {
        message: `No user found with id: '${id}'`
      };

      return request(app)
        .get(`/users/${id}`)
        .set("x-access-token", users[0].token)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expected_resp_body);
        });
    });
  });

  describe("POST /users/register", () => {
    let request_body;
    beforeEach(() => {
      request_body = {
        email: "john@example.com",
        name: "johnny5",
        password: "Secret1234!"
      };
    });
    it("should send new user id and jwt", () => {
    // console.log(users[0])
      return request(app)
        .post("/users/register")
        .send(request_body)
        .expect(200)
        .then(({ body }) => {
          console.log(body)
          expect(body.id).toBeDefined();
          expect(body.token).toBeDefined();
        });
    });
  });
});