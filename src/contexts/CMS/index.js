const { to } = require("await-to-js");
const { PollErrs, INVALID_ID } = require("../../errors/error_types");
const Poll = require("../../models/poll");
const Accounts = require("../accounts");

exports.createPoll = async ({prompt, candidates, user}) => {
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

exports.castVote = async ({poll_id, cand_name}) => {
  const [err, poll] = await to(getPollByID(poll_id));
  if (err) return Promise.reject(err);

  const { candidates } = poll;
  const chosen_candidate = candidates.find(c => c.name === cand_name);
  chosen_candidate.vote_count += 1;
  return poll.save();
};

exports.listPolls = user => {
  return Poll.find({ user });
};


async function getPollByID(id) {
  const [err, poll] = await to(Poll.findById(id));
  const notFoundError = {
    name: PollErrs.POLL_NOT_FOUND_ERR,
    message: `No poll found with id: ${id}`
  };

  if (!poll) {
    return Promise.reject(notFoundError);
  } else if (err) {
    return Promise.reject(err);
  }

  return Promise.resolve(poll);
}





