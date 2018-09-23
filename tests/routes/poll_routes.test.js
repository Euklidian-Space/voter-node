const request = require("supertest");
const app = require("../../app");
const { populateUsers, populatePolls } = require("../helpers");
const { head } = require("lodash/fp");
let users, polls;

beforeAll(async () => {
  users = await populateUsers(10);
  polls = await populatePolls(users);
});

describe("POST /poll/create", () => {
  it("should send error message for invalid token in header", () => {
    const expected_resp_body = {
      message: 'Token authentication failure'
    };

    return request(app)
      .post(`/poll`)
      .expect(401)
      .then(({ body }) => {
        return expect(body).toEqual(expected_resp_body);
      })
  });

  it("should send poll", () => {;
    const request_body = {
      prompt: "some prompt",
      candidates: ["candidate A", "candidate B"],
      user: head(users)._id  
    };

    return request(app)  
      .post("/poll")
      .set("x-access-token", head(users).token)
      .send(request_body)
      .expect(200)
      .then(({ body }) => {
        const expected_user_id = head(users)._id.toString();
        expect(body.user).toBe(expected_user_id);
        return expect(body).toEqual(
          expect.objectContaining({
            _id: expect.anything(),
            prompt: expect.anything(),
            candidates: expect.anything()
          })
        )
      });
  });

  it("should send an error message for invalid input", () => {
    const request_body = {
      prompt: "some prompt",
      candidates: ["one candidate"],
      user: head(users)._id
    };
    return request(app)
      .post('/poll')
      .set("x-access-token", head(users).token)
      .send(request_body)
      .expect(400)
      .then(({ body }) => {
        return expect(body.message).toBe("A poll must have atleast 2 candidates")
      });
  });
});

describe("POST /poll/vote", () => {
  it("should send error message for invalid token in header", () => {
    const expected_resp_body = {
      message: 'Token authentication failure'
    };

    return request(app)
      .post(`/poll/vote`)
      .expect(401)
      .then(({ body }) => {
        return expect(body).toEqual(expected_resp_body);
      })
  });

  it("should send updated poll", () => {
    const poll = head(polls);
    const request_body = {
      poll_id: poll._id,
      cand_name: head(poll.candidates).name
    };
    const expected_vote_count = head(poll.candidates).vote_count + 1;
 
    return request(app)
      .post("/poll/vote")
      .set("x-access-token", head(users).token)
      .send(request_body)
      .expect(200)
      .then(({ body }) => {
        const name = request_body.cand_name;
        const [candidate] = body.candidates.filter(p => p.name === name);
        return expect(candidate.vote_count).toBe(expected_vote_count);
      });
  });

  it("should send error message for invalid input", () => {
    const poll = head(polls);
    const request_body = {
      poll_id: "some invalid id",
      cand_name: head(poll.candidates).name
    };

    return request(app)
      .post("/poll/vote")
      .set("x-access-token", head(users).token)
      .send(request_body)
      .expect(404)
      .then(({ body }) => {
        return expect(body.message)
          .toBe("'some invalid id' is not a valid id");
      });
  });
});