const request = require("supertest");
const app = require("../../app");
const { populateUsers, populatePolls } = require("../helpers");
const { head } = require("lodash/fp");
let users, polls;

beforeAll(async () => {
  users = await populateUsers(10);
  polls = await populatePolls(users);
});

describe("GET /poll/:user_id", () => {
  it("should send error message for invalid token in header", () => {
    const id = head(users)._id;
    const expected_resp_body = {
      message: 'Token authentication failure'
    };
    return request(app)
      .get(`/poll/${id}`)
      .set("x-access-token", users[0].token)
      .expect(401)
      .then(({ body }) => {
        return expect(body).toEqual(expected_resp_body); 
      });
  });
});