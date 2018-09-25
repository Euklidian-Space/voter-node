const { to } = require("await-to-js");
const PollController = require("src/controllers/poll_controller");
const { generateMongoIDs, createFakePolls } = require("../helpers");
const { VALIDATION_ERR, INVALID_ID } = require("src/errors/error_types");
const Poll = require("src/models/poll");


let next;

beforeEach(() => {
  next = jest.fn();
});


describe("Poll Controller", () => {
  let req, res, sendSpy, statusMock;
  beforeEach(() => {
    sendSpy = jest.fn();
    statusMock = jest.fn().mockImplementation(code => res);
    res = {
      send: sendSpy,
      status: statusMock
    };
  });

  describe("Create", () => {
    beforeEach(() => {
      req = {
        body: {
          prompt: "some prompt",
          candidates: ["candA", "candB"],
        },
        userID: "some_user_id"
      };
    });

    it("should call createPoll from CMS context", async () => {
      const repo = {
        createPoll: jest.fn()
      };
      const { create } = PollController.actions(repo);
      await to(create(req, res));
      return expect(repo.createPoll).toHaveBeenCalledWith(expect.objectContaining({
        ...req.body,
        user: req.userID
      }));
    });

    it("should send 200 status", async () => {
      const repo = {
        createPoll: jest.fn().mockResolvedValue(req.body)
      }
      const { create } = PollController.actions(repo);
      await to(create(req, res));
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy)
        .toHaveBeenCalledWith(expect.objectContaining(req.body));
    });

    it("should call next with errObj", async () => {
      const errObj = {
        name: VALIDATION_ERR,
        errors: {
          fieldA: "some data",
          fieldB: "some data"
        }
      };
      const repo = {
        createPoll: jest.fn().mockRejectedValue(errObj)
      };
      const { create } = PollController.actions(repo);
      await create(req, res, next);
      return expect(next).toHaveBeenCalledWith(expect.objectContaining(errObj));
    });
  });

  describe("vote", () => {
    const [fakePoll] = createFakePolls(1);
    const poll = new Poll(fakePoll);

    beforeEach(() => {
      req = {
        body: {
          poll_id: poll.id,
          cand_name: poll.candidates[0].name
        }
      };
    });

    it("should call castVote from repo", async () => {
      const repo = {
        castVote: jest.fn()
      };
      const { vote } = PollController.actions(repo);
      await to(vote(req, res));
      return expect(repo.castVote).toHaveBeenCalledWith({
        ...req.body
      });
    });

    it("should send status 200", async () => {
      const repo = {
        castVote: jest.fn().mockResolvedValue(poll)
      };
      const { vote } = PollController.actions(repo);
      await to(vote(req, res));
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith(poll);
    });

    it("should call next with error object", async () => {
      const errObj = {
        name: VALIDATION_ERR,
        errors: {
          fieldA: "some data",
          fieldB: "some data"
        }
      };
      const repo = {
        castVote: jest.fn().mockRejectedValue(errObj)
      };
      const { vote } = PollController.actions(repo);
      await vote(req, res, next);
      return expect(next).toHaveBeenCalledWith(expect.objectContaining(errObj));
    });
  });
});
