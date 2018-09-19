const { to } = require("await-to-js");
const PollController = require("src/controllers/poll_controller");
const { generateMongoIDs, createFakePolls } = require("../helpers");
const { VALIDATION_ERR, INVALID_ID } = require("src/errors/error_types");
const Poll = require("src/models/poll");

// jest.mock("src/contexts/CMS", () => {
//   return {
//     createPoll: jest.fn(),
//     castVote: jest.fn(),
//     listUserPolls: jest.fn()
//   };
// });
// const { createPoll, castVote, listUserPolls } = require("src/contexts/CMS");
// const { createPollMock, castVoteMock, listUserPollsMock } = require("../mocks/cms_context_mocks");

let next;

beforeEach(() => {
  next = jest.fn();
});

// afterAll(jest.clearAllMocks);

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
    // const resolvedPollMock = createPollMock(true);
    // const rejectedPollMock = createPollMock(false);

    beforeEach(() => {
      req = {
        body: {
          prompt: "some prompt",
          candidates: ["candA", "candB"],
          user: "some_user_id"
        }
      };
    });

    it("should call createPoll from CMS context", async () => {
      // createPoll.mockImplementation(resolvedPollMock);
      const repo = {
        createPoll: jest.fn()
      };
      const { create } = PollController.actions(repo);
      await to(create(req, res));
      return expect(repo.createPoll).toHaveBeenCalledWith({
        ...req.body
      });
    });

    it("should send 200 status", async () => {
      // createPoll.mockImplementation(resolvedPollMock);
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
      // createPoll.mockImplementation(rejectedPollMock(errObj));
      const repo = {
        createPoll: jest.fn().mockRejectedValue(errObj)
      };
      const { create } = PollController.actions(repo);
      await create(req, res, next);
      return expect(next).toHaveBeenCalledWith(expect.objectContaining(errObj));
    });
  });

  describe("vote", () => {
    // const resolvedVoteMock = castVoteMock(true);
    // const rejectedVoteMock = castVoteMock(false);
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
      // castVote.mockImplementation(resolvedVoteMock(poll));
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
      // castVote.mockImplementation(resolvedVoteMock(poll));
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
      // castVote.mockImplementation(rejectedVoteMock(errObj));
      await vote(req, res, next);
      return expect(next).toHaveBeenCalledWith(expect.objectContaining(errObj));
    });
  });
});