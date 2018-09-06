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
const insertUsers = seedUsers(10);
const insert_10_Polls = seedPolls(10);
const intoDatabase = users => {
  return Promise.all(users.map(u => {
    const newUser = new User(u);
    return newUser.save();
  }));
};    

let connection;
let db;
let seeded_users;

beforeAll(async done => {
  connection = await connectToTestDB(global.__MONGO_URI__);
  db = connection.db;
  seeded_users = await insertUsers(intoDatabase);
  done();
});

afterAll(async () => {
  await disconnectTestDB(connection, db);
});

describe("CreatePoll", () => {
  it("should insert a poll into the db when valid and update user record", async () => {
    const ownerID = seeded_users[0].id;
    const poll = {
     prompt: "which color is the best?",
     candidates: ["green", "brown"],
     user: ownerID
    };
    const savedPoll = await createPoll(poll);
    expect(savedPoll).toBeTruthy();

    const updatedUser = await User.findById(ownerID);
    expect(updatedUser).toBeTruthy();
    const expected_poll = savedPoll.id;
    const received_poll = updatedUser.polls[0].toString();

    expect(
      Poll.find({prompt: "which color is the best?"})
    ).resolves.toHaveLength(1);
    return expect(received_poll).toEqual(expected_poll);
  });

  it("should reject with error message for invalid poll", async () => {
    const poll = {
     prompt: "which color is the best?",
     candidates: ["green", "brown"]
    };
    const [errs, savedPoll] = await to(createPoll(poll));
    expect(savedPoll).toBeFalsy();
    return expect(errs).toBeTruthy();
  });
});

describe("castVote", () => {
  let poll = {
    prompt: "which color is the best?",
    candidates: ["green", "brown"]
  };
  let savedPoll;

  beforeEach(async done => {
    poll.user = seeded_users[0].id;
    savedPoll = await createPoll(poll);
    done();
  });

  it("should update the vote count of given candidate", async () => {
    const cand_name = "green";
    const poll_id = savedPoll.id;
    const {candidates} = await castVote({poll_id, cand_name});
    const received_candidate = candidates.find(c => c.name === cand_name);
    expect(received_candidate).toBeTruthy();
    return expect(received_candidate.vote_count).toBe(1);
  });

  it("should save updated poll to db", async () => {
    const cand_name = "green";
    const poll_id = savedPoll.id;
    await castVote({poll_id, cand_name});
    const {candidates} = await Poll.findById(poll_id);
    const received_candidate = candidates.find(c => c.name === cand_name);
    expect(received_candidate).toBeTruthy();
    return expect(received_candidate.vote_count).toBe(1);
  });

  it("should return err obj for a not found poll id", async () => {
    const cand_name = 'some name';
    const poll_id = generateMongoIDs(1)[0].toString();
    const expected_err = {
      name: PollErrs.POLL_NOT_FOUND_ERR,
      message: `No poll found with id: ${poll_id}`
    };
    return expect(castVote({poll_id, cand_name})).rejects
      .toEqual(expected_err);
  });
});

describe("listPolls", () => {
  let user1, user2;
  const intoDatabase = polls => {
    const [poll_1, poll_2, poll_3, ...rest] = polls;
    [user1, user2] = seeded_users;
    polls = [poll_1, poll_2, poll_3]
      .map(p => Object.assign(p, {user: user1.id}))
      .concat(rest.map(p => Object.assign(p, {user: user2.id})))
      .map(p => createPoll(p));
    return Promise.all(polls);
  };
  
  beforeAll(async done => {
    let polls = await insert_10_Polls(intoDatabase);
    done();
  });

  it("should list all polls for given user id", async () => {
    const [_, polls] = await to(listPolls(user1.id));
    const userPolls = polls.filter(p => p.user.equals(user1.id));
    return expect(userPolls.length).toBeGreaterThan(0);
  });
});















