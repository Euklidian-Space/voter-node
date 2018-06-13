const { to } = require("await-to-js");
const { INVALID_ID, UserErrs } = require("../../errors/error_types");
const { createPoll, castVote, listPolls } = require("../../contexts/CMS");
const { 
  connectToTestDB, 
  disconnectTestDB, 
  clearDBCollection, 
  seedUsers, 
  seedPolls,
  generateMongoIDs
 } = require("../helpers");
const User = require("../../models/user");
const Poll = require("../../models/poll");
const Candidate = require("../../models/poll_candidate");
const insertUser = seedUsers(1);
const insert_10_Polls = seedPolls(10);

let db;

beforeEach(() => {
  return connectToTestDB()
    .then(dbInstance => {
      db = dbInstance;
    }).catch(err => console.log(err));
});

afterEach(async done => {
  if (!db) return Promise.resolve(null);

  const clear = (_db, collections) => {
    const clearedCollections = collections.map(collection => {
      return clearDBCollection(_db, collection);
    });
    return Promise.all(clearedCollections);
  };
  const [err, _] = await to(clear(db, ["users", "polls", "candidates"]));

  if (err) console.log(err);
  // db = null;
  done();
});

afterAll(done => {
  if (db) {
    db = null;
    return disconnectTestDB(db);
  } 

  done();
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
    const userPolls = polls.filter(p => p.user.equals(user));
    return expect(userPolls.length).toBe(3);
  });
});















