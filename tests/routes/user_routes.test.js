const request = require("supertest");
const app = require("../../app");
const { populateUsers } = require("../helpers");
let users;

beforeAll(async done => {
  users = await populateUsers(10);
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
        .get(`/user/${id}`)
        .set("x-access-token", users[0].token)
        .expect(404)
        .then(res => {
          expect(res.body).toEqual(expected_resp_body);
        });
    });
  });

  xdescribe("POST /user/register", () => {
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
          console.log(body)
          expect(body.user.id).toBeDefined();
          expect(body.user.token).toBeDefined();
        });
    });
  })
});