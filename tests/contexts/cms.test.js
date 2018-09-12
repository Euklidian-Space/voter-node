const { to } = require("await-to-js");
const { last } = require("lodash/fp");
const { PollErrs, INVALID_ID } = require("src/errors/error_types");
const { createPoll, castVote, listUserPolls, getPollById, removePoll } = require("src/contexts/CMS");
const { 
  connectToTestDB,
  generateMongoIDs,
  populateUsers,
  populatePolls
 } = require("../helpers");
const User = require("src/models/user");
const Poll = require("src/models/poll");
let seeded_users;
let seeded_polls;

beforeAll(async done => {
  await connectToTestDB(global.__MONGO_URI__);
  seeded_users = await populateUsers(10);
  seeded_polls = await populatePolls(seeded_users);
  done();
});

describe("CreatePoll", () => {
  it("should insert a poll into the db when valid and update user record", async () => {
    const ownerID = seeded_users[0]._id.toString();

    const poll = {
     prompt: "which color is the best?",
     candidates: ["green", "brown"],
     user: ownerID
    };


    const savedPoll = await createPoll(poll);
    expect(savedPoll).toBeTruthy();

    const updatedUser = await User.findById(ownerID);
    expect(updatedUser).toBeTruthy();
    expect(updatedUser.polls.length).toBeGreaterThan(0);
    const expected_poll_id = savedPoll.id.toString();
    const received_poll_id = last(updatedUser.polls).toString();

    expect(
      Poll.find({prompt: "which color is the best?"})
    ).resolves.toHaveLength(1);
    return expect(received_poll_id).toEqual(expected_poll_id);
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
  let savedPoll;

  beforeEach(async done => {
    // poll.user = seeded_users[0].id;
    // savedPoll = await createPoll(poll);
    console.log(seeded_polls);
    done();
  });

  xit("should update the vote count of given candidate", async () => {
    const cand_name = "green";
    const poll_id = savedPoll.id;
    const {candidates} = await castVote({poll_id, cand_name});
    const received_candidate = candidates.find(c => c.name === cand_name);
    expect(received_candidate).toBeTruthy();
    return expect(received_candidate.vote_count).toBe(1);
  });

  xit("should save updated poll to db", async () => {
    const cand_name = "green";
    const poll_id = savedPoll.id;
    await castVote({poll_id, cand_name});
    const {candidates} = await Poll.findById(poll_id);
    const received_candidate = candidates.find(c => c.name === cand_name);
    expect(received_candidate).toBeTruthy();
    return expect(received_candidate.vote_count).toBe(1);
  });

  xit("should return err obj for a not found poll id", async () => {
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

// xdescribe("retrieving and deleting polls", () => {
//   let user1, user2, poll, poll2;
//   const intoDatabase = polls => {
//     const [poll_1, poll_2, poll_3, ...rest] = polls;
//     [user1, user2] = seeded_users;
//     polls = [poll_1, poll_2, poll_3]
//       .map(p => Object.assign(p, {user: user1.id}))
//       .concat(rest.map(p => Object.assign(p, {user: user2.id})))
//       .map(p => createPoll(p));
//     return Promise.all(polls);
//   };
  
//   beforeAll(async done => {
//     [poll, poll2] = await insert_10_Polls(intoDatabase);
//     done();
//   });

//   describe("listUserPolls", () => {
//     it("should list all polls for given user id", async () => {
//       const [_, polls] = await to(listUserPolls(user1.id));
//       const userPolls = polls.filter(p => p.user.equals(user1.id));
//       return expect(userPolls.length).toBeGreaterThan(0);
//     });
//   });

//   xdescribe("getPollById", () => {
//     it("should return poll from db", async () => {
//       let received_poll = await getPollById(poll.id);
//       return expect(received_poll.prompt)
//         .toEqual(poll.prompt);
//     });

//     it("should return an error obj when poll is not found", () => {
//       const invalid_id = "000000000000000000000000";
//       return expect(getPollById(invalid_id))
//         .rejects
//         .toEqual({
//           name: PollErrs.POLL_NOT_FOUND_ERR,
//           message: `No poll found with id: ${invalid_id}`          
//         });
//     });

//     it("should return an error obj when poll id is invalid", () => {
//       const invalid_id = "some invalid id";
//       return expect(getPollById(invalid_id))
//         .rejects
//         .toEqual({
//           message: `'${invalid_id}' is not a valid id`,
//           name: INVALID_ID
//         })
//     });
//   });

//   xdescribe("removePoll", () => {
//     it("should remove poll from DB", async () => {
//       let pollID = poll.id;
//       await removePoll(pollID);
//       let received_poll = await Poll.findById(pollID);
//       return expect(received_poll).toBeNull();
//     });

//     it("should return error obj if id not found or invalid id",  () => {
//       const not_found_id = "000000000000000000000000";
//       const invalid_id = "invalid id";
//       expect(removePoll(invalid_id))
//         .rejects
//         .toEqual({
//           message: `'${invalid_id}' is not a valid id`,
//           name: INVALID_ID
//         });

//       return expect(removePoll(not_found_id))
//         .rejects
//         .toEqual({
//           name: PollErrs.POLL_NOT_FOUND_ERR,
//           message: `No poll found with id: ${not_found_id}`
//         });
//     });

//     it("should remove poll from associated user", async () => {
//       const pollID = poll2.id;
//       await removePoll(pollID);
//       const received_polls = await listUserPolls(user1.id);
//       const received_poll = received_polls.find(p => p.id === pollID);
//       return expect(received_poll).toBeUndefined();
//     });

//   });

// });
