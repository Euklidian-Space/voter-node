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
      return request(app)
        .get(`/users/${id}`)
        .expect(401);
    });

    // it("Sends requested user when they exist", () => {
    //   request(app)
    //     .get("/users/")
    // });
  });
});