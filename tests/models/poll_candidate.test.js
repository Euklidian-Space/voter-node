const { to } = require("await-to-js");
const PollCandidate = require("../../models/poll_candidate");
const Poll = require("../../models/poll");

describe("PollCandidate", () => {
  it("should require a name field", async () => {
    const poll_candidate = new PollCandidate();
    [errs, _] = await to(poll_candidate.validate());

    const { message } = errs.errors.name;

    return expect(message).toBe("Path `name` is required.");
  });

  it("should have atleast one poll", async () => {
    const pc = new PollCandidate({name: "FDR"});
    [errs, _] = await to(pc.validate());
    expect(errs).toBeTruthy();
    
    const { message } = errs.errors.polls

    return expect(message).toBe(`A poll candidate must have atleast 1 poll.`);
  });

  // it("should ")
});