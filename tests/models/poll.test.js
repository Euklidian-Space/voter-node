const { to } = require("await-to-js");
const Poll = require("../../models/poll");

describe("Poll", () => {
  it("should require a prompt", async () => {
    const poll = new Poll();
    const [errs, _] = await to(poll.validate());
    const { message } = errs.errors.prompt;

    expect(message).toBe("Path `prompt` is required.");
  });
});