const { to } = require("await-to-js");
const PollController = require("src/controllers/poll_controller");
const { generateMongoIDs, createFakePolls } = require("../helpers");
const { VALIDATION_ERR, INVALID_ID } = require("src/errors/error_types");
const Poll = require("src/models/poll");

jest.mock("src/contexts/CMS", () => {
  return {
    createPoll: jest.fn(),
    castVote: jest.fn(),
    listPolls: jest.fn()
  };
});
const { createPoll, castVote, listPolls } = require("src/contexts/CMS");
const { createPollMock, castVoteMock, listPollsMock } = require("../mocks/cms_context_mocks");

afterAll(jest.clearAllMocks);

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
    const resolvedPollMock = createPollMock(true);
    const rejectedPollMock = createPollMock(false);

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
      createPoll.mockImplementation(resolvedPollMock);
      await to(PollController.create(req, res));
      return expect(createPoll).toHaveBeenCalledWith({
        ...req.body
      });
    });

    it("should send 200 status and return poll data in response object", async () => {
      createPoll.mockImplementation(resolvedPollMock);
      await to(PollController.create(req, res));
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy)
        .toHaveBeenCalledWith(expect.objectContaining(req.body));
    });

    it("should resolve with a poll", async () => {
      createPoll.mockImplementation(resolvedPollMock);
      const [err, poll] = await to(PollController.create(req, res));
      expect(err).toBeFalsy();
      return expect(poll)
        .toEqual(expect.objectContaining(req.body));
    });

    it("should send status 404 for known errortype", async () => {
      const errObj = {
        name: VALIDATION_ERR,
        errors: {
          fieldA: "some data",
          fieldB: "some data"
        }
      };
      createPoll.mockImplementation(rejectedPollMock(errObj));
      const [err, _] = await to(PollController.create(req, res));
      expect(statusMock).toHaveBeenCalledWith(404);
      return expect(err).toEqual(expect.objectContaining(errObj.errors));
    });

    it("should send status 500 for unknown error type", async () => {
      const errObj = {
        fieldA: "unknown err object shape",
        name: "unknown type"
      };

      createPoll.mockImplementation(rejectedPollMock(errObj));
      await to(PollController.create(req, res));

      return expect(statusMock).toHaveBeenCalledWith(500);
    });

  });

  describe("vote", () => {
    const resolvedVoteMock = castVoteMock(true);
    const rejectedVoteMock = castVoteMock(false);
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

    it("should call castVote from CMS context", async () => {
      castVote.mockImplementation(resolvedVoteMock(poll));
      await to(PollController.vote(req, res));
      return expect(castVote).toHaveBeenCalledWith({
        ...req.body
      });
    });

    it("should send status 200 and return poll data in response object", async () => {
      castVote.mockImplementation(resolvedVoteMock(poll));
      const [_, received_poll] = await to(PollController.vote(req, res));
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendSpy).toHaveBeenCalledWith(poll);
      return expect(received_poll).toEqual(poll);
    });

    it("should send 404 for a known error type", async () => {
      const errObj = {
        name: VALIDATION_ERR,
        errors: {
          fieldA: "some data",
          fieldB: "some data"
        }
      };
      castVote.mockImplementation(rejectedVoteMock(errObj));
      const [err, _] = await to(PollController.vote(req, res));
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendSpy).toHaveBeenCalledWith(errObj.errors);
      return expect(err).toEqual(expect.objectContaining(errObj.errors));
    });

    it("should send status 500 for unknown error type", async () => {
      const errObj = {
        fieldA: "unknown err object shape",
        name: "unknown type"
      };

      castVote.mockImplementation(rejectedVoteMock(errObj));
      await to(PollController.vote(req, res));

      return expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe("getUserPolls", () => {
    const resolvedListPollsMock = listPollsMock(true);
    const rejectedListPollsMock = listPollsMock(false);
    const fakePolls = createFakePolls(4);
    const { user } = fakePolls[0]

    beforeEach(() => {
      req.body = {
        user
      };
    })

    it("should call listPolls from CMS context", async () => {
      listPolls.mockImplementation(resolvedListPollsMock(fakePolls));
      await to(PollController.getPolls(req, res));
      return expect(listPolls).toHaveBeenCalledWith(user);
    });

    it("should send 200 status and return polls associated with given user", async () => {
      listPolls.mockImplementation(resolvedListPollsMock(fakePolls));
      const expected_polls = [fakePolls[0]];
      const [_, polls] = await to(PollController.getPolls(req, res));
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendSpy).toHaveBeenCalledWith(expected_polls);
      return expect(polls).toEqual(expected_polls);
    });

    it("should send 404 status for known error type", async () => {
      const errObj = {
        name: INVALID_ID,
        message: "some message"
      };

      listPolls.mockImplementation(rejectedListPollsMock(errObj));
      const [errs, _] = await to(PollController.getPolls(req, res));
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendSpy).toHaveBeenCalledWith({message: errObj.message});
      return expect(errs).toEqual(errObj);
    });
  });

});