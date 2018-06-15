const { to } = require("await-to-js");
// const { map, flow } = require("lodash/fp");
// const User = require("../../models/user");
const { PollErrs, INVALID_ID } = require("../../errors/error_types");
const Poll = require("../../models/poll");
const PollCandidate = require("../../models/poll_candidate");

exports.createPoll = async ({prompt, candidates, user}) => {
  const newPoll = new Poll({
    prompt,
    user,
  });
  const candidateIDs = await getCandidateIDs(candidates, newPoll.id, PollCandidate);
  newPoll.candidates = candidateIDs.map(cand_id => {
    return { cand_id };
  });

  let [errs, savedPoll] = await to(newPoll.save());
  if (errs) return Promise.reject(errs);

  return Promise.resolve(savedPoll);
};

exports.castVote = async ({poll_id, cand_id}) => {
  const invalid_id = invalidIDAmong([poll_id, cand_id]);
  if (invalid_id) {
    return Promise.reject({
      message: `'${invalid_id}' is not a valid id`,
      name: INVALID_ID
    });
  }
  const [err, poll] = await to(Poll.findById(poll_id));
  // const [err, poll] = await to(Poll.findOne({id: poll_id}));
  console.log("err: ", err);
  const { candidates } = poll;
  const chosen_candidate = candidates.find(c => c.cand_id.equals(cand_id));
  chosen_candidate.vote_count += 1;
  return poll.save();
};

exports.listPolls = async user => {
  return Poll.find({ user });
};

async function getCandidateIDs(names, poll_id, model) {
  const [err, candidates] = await to(getCandidates(names, poll_id, model));
  return Promise.resolve(candidates.map(cand => cand.id));
}

function getCandidates(names, poll_id, model) {
  const candidates = names.map(async name => {
    let [err, foundCandidate] = await to(findCandidateWith({name}, model));
    if (foundCandidate) {
      let { polls } = foundCandidate;
      foundCandidate.polls = [poll_id, ...polls];
      return foundCandidate.save();
    }
    return createCandidate({name, poll_id}, model);
  });

  return Promise.all(candidates);
}

async function findCandidateWith(opts, model) {
  const [err, candidates] = await to(model.find(opts));
  if (err) return Promise.reject(err);

  return Promise.resolve(candidates[0]);
}

function createCandidate({name, poll_id}, model) {
  return model.create({
    name,
    polls: [poll_id]
  });
}

function invalidIDAmong(ids) {
  return ids.find(id => !isValidID(id));
}

function isValidID(id) {
  return id.match(/^[0-9a-f]{24}$/i);
}
