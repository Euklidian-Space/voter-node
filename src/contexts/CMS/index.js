const { to } = require("await-to-js");
const { PollErrs, INVALID_ID } = require("../../errors/error_types");
const Poll = require("../../models/poll");
const Accounts = require("../accounts");

const INVALID_ID_ERR_OBJ = id => {
  return {
    message: `'${id}' is not a valid id`,
    name: INVALID_ID
  };
}

const ID_NOT_FOUND_ERR_OBJ = id => {
  return {
    name: PollErrs.POLL_NOT_FOUND_ERR,
    message: `No poll found with id: ${id}`
  };
};

async function createPoll({prompt, candidates, user}) {
  const [user_err, found_user] = await to(Accounts.getUserById(user))
  if (user_err) return Promise.reject(user_err);

  const newPoll = new Poll({
    prompt,
    user: found_user.id,
  });
  newPoll.candidates = candidates.map(c => Object.assign({}, {name: c}));

  let [errs, savedPoll] = await to(newPoll.save());
  if (errs) return Promise.reject(errs);

  found_user.polls.push(savedPoll.id);
  [errs, _] = await to(found_user.save());
  if (errs) return Promise.reject(errs);

  return Promise.resolve(savedPoll);
};

async function castVote ({poll_id, cand_name}) {
  const [err, poll] = await to(getPollById(poll_id));
  if (err) return Promise.reject(err);

  const { candidates } = poll;
  const chosen_candidate = candidates.find(c => c.name === cand_name);
  chosen_candidate.vote_count += 1;
  return poll.save();
};
function listUserPolls(user) {
  return Poll.find({ user });
};

async function getPollById(id) {
  if (!isValidID(id)) 
    return Promise.reject(INVALID_ID_ERR_OBJ(id));

  const [err, poll] = await to(Poll.findById(id));
  const notFoundError = ID_NOT_FOUND_ERR_OBJ(id);

  if (!poll) {
    return Promise.reject(notFoundError);
  } else if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve(poll);
}

async function removePoll(id) {
  if (!isValidID(id)) 
    return Promise.reject(INVALID_ID_ERR_OBJ(id));

  const doc = await Poll.findByIdAndRemove(id);
  if (doc === null) {
    return Promise.reject(ID_NOT_FOUND_ERR_OBJ(id));
  }

  return Promise.resolve(doc);
}

function isValidID(id) {
  if (!id || !id.match(/^[0-9a-f]{24}$/i)) 
    return false;
  
  return true;
}

module.exports = {
  createPoll,
  castVote,
  listUserPolls,
  getPollById,
  removePoll
};