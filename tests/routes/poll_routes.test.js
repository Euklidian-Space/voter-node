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
      .expect(401)
      .then(({ body }) => {
        return expect(body).toEqual(expected_resp_body); 
      });
  });

  it("should send polls of associated user id", () => {
    const id = head(users)._id;
    const expected_poll_ids = polls.filter(p => p.user === id)
      .map(p => p._id.toString());
    return request(app)
      .get(`/poll/${id}`)
      .set("x-access-token", users[0].token)
      .expect(200)
      .then(({ body }) => {
        const received_poll_ids = body.polls.map(p => p._id);
        return expect(received_poll_ids).toEqual(expected_poll_ids);
      });
  });

  it("should respond with error message", () => {
    const id = "12349lhlid";
    return request(app)
      .get(`poll/${id}`)
      .set("x-access-token", users[0].token)
      .expect(404)
      .then(({ body }) => {
        console.log(body);
        //return expect(body.message).toBe(`'${id} is not a valid id`)
      });
  });
});

