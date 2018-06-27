const { range } = require("lodash/fp");
const { to } = require("await-to-js");
const Poll = require("src/models/poll");
const { generateMongoIDs } = require("../helpers/index");

describe("Poll", () => {
  it("should require a prompt", async () => {
    const poll = new Poll();
    const [errs, _] = await to(poll.validate());
    const { message } = errs.errors.prompt;

    expect(message).toBe("Path `prompt` is required.");
  });

  it("should have atleast two PollCandidates", async () => {
    const poll = new Poll({
      prompt: "which is the better language?"
    });
    const [errs, _] = await to(poll.validate());
    expect(errs).toBeTruthy();
    const { message } = errs.errors.candidates;
    return expect(message).toBe(`A poll must have atleast 2 candidates`);
  });

  it("should have candidates with vote count", async () => {
    const [cand1_id, cand2_id, user_id] = [1, 1, 1].map(generateMongoIDs);
    const cand1 = { cand_id: cand1_id };
    const cand2 = { cand_id: cand2_id };
    const poll = new Poll({
      prompt: "some prompt",
      user: user_id,
      candidates: [cand1, cand2]
    });
    const [errs, _] = await to(poll.validate());
    poll.candidates.forEach(candidate => {
      expect(candidate.vote_count).toBe(0);
    });
    return expect(errs).toBeFalsy();
  });

  it("should be associated to a user", async () => {
    const candidates = generateMongoIDs(2);
    const poll = new Poll({
      prompt: "which is the better language",
      candidates
    });
    const [errs, _] = await to(poll.validate());
    expect(errs).toBeTruthy();
    const { message } = errs.errors.user;

    return expect(message).toBe("Path `user` is required.");
  });
});
