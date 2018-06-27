const { to } = require("await-to-js");
const { INVALID_ID, PollErrs } = require("src/errors/error_types");
const { createPoll, castVote, listPolls } = require("src/contexts/CMS");
const { 
  connectToTestDB,
  disconnectTestDB,
  seedUsers, 
  seedPolls,
  generateMongoIDs
 } = require("../helpers");
const User = require("src/models/user");
const Poll = require("src/models/poll");
const insertUser = seedUsers(1);
const insert_10_Polls = seedPolls(10);

let connection;
let db;

beforeAll(async () => {
  connection = await connectToTestDB(global.__MONGO_URI__);
  db = connection.db;
});

afterAll(async () => {
  await disconnectTestDB(connection, db);
});

describe("CreatePoll", () => {
  let ownerID;
  const intoDatabase = users => {
    const [user] = users;
    const newUser = new User(user);
    ownerID = newUser.id;
    return newUser.save();
  };    

  beforeEach(async () => insertUser(intoDatabase));

  it("should insert a poll into the db when valid", async () => {
    const poll = {
     prompt: "which color is the best?",
     candidates: ["green", "brown"],
     user: ownerID
    };
    const [errs, savedPoll] = await to(createPoll(poll));

    expect(errs).toBeFalsy();
    expect(savedPoll).toEqual(expect.objectContaining(savedPoll));
    return expect(
      Poll.find({prompt: "which color is the best?"})
    ).resolves.toHaveLength(1);
  });

  it("should reject with error message for invalid poll", async () => {
    const poll = {
     prompt: "which color is the best?",
     candidates: ["green", "brown"]
    };
    const expected_err_msg = "Path `user` is required.";
    const [errs, savedPoll] = await to(createPoll(poll));
    const received_err_msg = errs.errors.user.message;
    expect(savedPoll).toBeFalsy();
    return expect(received_err_msg).toEqual(expected_err_msg);
  });
});

describe("castVote", () => {
  let poll = {
    prompt: "which color is the best?",
    candidates: ["green", "brown"]
  };
  let savedPoll;
  const intoDatabase = users => {
    const [user] = users;
    const newUser = new User(user);
    return newUser.save();
  };    

  beforeEach(async done => {
    const { id } = await insertUser(intoDatabase);
    poll.user = id;
    savedPoll = await createPoll(poll);
    done();
  });

  it("should update the vote count of given candidate", async () => {
    const cand_id = savedPoll.candidates[0].cand_id.toString();
    const poll_id = savedPoll.id;
    const {candidates} = await castVote({poll_id, cand_id});
    const received_candidate = candidates.find(c => c.cand_id.equals(cand_id));
    expect(received_candidate).toBeTruthy();
    return expect(received_candidate.vote_count).toBe(1);
  });

  it("should save updated poll to db", async () => {
    const cand_id = savedPoll.candidates[0].cand_id.toString();
    const poll_id = savedPoll.id;
    await castVote({poll_id, cand_id});
    const {candidates} = await Poll.findById(poll_id);
    const received_candidate = candidates.find(c => c.cand_id.equals(cand_id));
    expect(received_candidate).toBeTruthy();
    return expect(received_candidate.vote_count).toBe(1);
  });

  it("should return err obj for invalid ids", async () => {
    const cand_id = 'invalid id';
    const poll_id = 'invalid id';
    const expected_err = {
      name: INVALID_ID,
      message: `'${poll_id}' is not a valid id`,
    }
    return expect(castVote({poll_id, cand_id})).rejects.toEqual(expected_err);
  });

  it("should return err obj for a not found poll id", async () => {
    const cand_id = savedPoll.candidates[0].cand_id.toString();
    const poll_id = generateMongoIDs(1)[0].toString();
    const expected_err = {
      name: PollErrs.POLL_NOT_FOUND_ERR,
      message: `No poll found with id: ${poll_id}`
    };
    return expect(castVote({poll_id, cand_id})).rejects
      .toEqual(expected_err);
  });
});

describe("listPolls", () => {
  let user;
  const intoDatabase = polls => {
    const [poll_1, poll_2, poll_3, ...rest] = polls;
    [user] = generateMongoIDs(1);
    polls = [poll_1, poll_2, poll_3]
      .map(p => Object.assign(p, {user}))
      .concat(rest)
      .map(p => createPoll(p));

    return Promise.all(polls);
  };

  beforeAll(() => insert_10_Polls(intoDatabase));

  it("should list all polls for given user id", async () => {
    const [_, polls] = await to(listPolls(user.toString()));
    const userPolls = polls.filter(p => p.user.equals(user.toString()));
    return expect(userPolls.length).toBe(3);
  });
});















