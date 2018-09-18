const { to } = require("await-to-js");
const PollController = require("src/controllers/poll_controller");
const { generateMongoIDs, createFakePolls } = require("../helpers");
const { VALIDATION_ERR, INVALID_ID } = require("src/errors/error_types");
const Poll = require("src/models/poll");

jest.mock("src/contexts/CMS", () => {
  return {
    createPoll: jest.fn(),
    castVote: jest.fn(),
    listUserPolls: jest.fn()
  };
});
const { createPoll, castVote, listUserPolls } = require("src/contexts/CMS");
const { createPollMock, castVoteMock, listUserPollsMock } = require("../mocks/cms_context_mocks");

let next;

beforeEach(() => {
  next = jest.fn();
});

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

    it("should call next with errObj", async () => {
      const errObj = {
        name: VALIDATION_ERR,
        errors: {
          fieldA: "some data",
          fieldB: "some data"
        }
      };
      createPoll.mockImplementation(rejectedPollMock(errObj));
      // const [err, _] = await to(PollController.create(req, res));
      // expect(statusMock).toHaveBeenCalledWith(404);
      await PollController.create(req, res, next);
      return expect(next).toHaveBeenCalledWith(expect.objectContaining(errObj));
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

    it("should call next with error object", async () => {
      const errObj = {
        name: VALIDATION_ERR,
        errors: {
          fieldA: "some data",
          fieldB: "some data"
        }
      };
      castVote.mockImplementation(rejectedVoteMock(errObj));
      await PollController.vote(req, res, next);
      return expect(next).toHaveBeenCalledWith(expect.objectContaining(errObj));
    });
  });

  describe("listUserPolls", () => {
    const resolvedListPollsMock = listUserPollsMock(true);
    const rejectedListPollsMock = listUserPollsMock(false);
    const fakePolls = createFakePolls(4);
    const { user } = fakePolls[0]

    beforeEach(() => {
      req.params = {
        id: user
      };
    })

    it("should call listUserPolls from CMS context", async () => {
      listUserPolls.mockImplementation(resolvedListPollsMock(fakePolls));
      await to(PollController.getPolls(req, res));
      return expect(listUserPolls).toHaveBeenCalledWith(user);
    });

    it("should send 200 status and return polls associated with given user", async () => {
      listUserPolls.mockImplementation(resolvedListPollsMock(fakePolls));
      const expected = {
        polls: [fakePolls[0]]
      };
      await PollController.getPolls(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      return expect(sendSpy).toHaveBeenCalledWith(expected);
    });

    it("should call next with error object", async () => {
      const errObj = {
        name: INVALID_ID,
        message: "some message"
      };

      listUserPolls.mockImplementation(rejectedListPollsMock(errObj));
      await PollController.getPolls(req, res, next);
      return expect(next).toHaveBeenCalledWith(errObj);
    });
  });

});