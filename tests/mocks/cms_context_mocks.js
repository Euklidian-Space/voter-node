// const { INVALID_ID, PollErrs } = require("../../errors/error_types");
const Poll = require("../../models/poll");
const { to } = require("await-to-js");

exports.createPollMock = isValid => {
  if (isValid) return pollObj => Promise.resolve(pollObj);

  return errs => () => Promise.reject(errs);
};

exports.castVoteMock = isResolved => {
  if (isResolved) {
    return pollObj => ({cand_id, poll_id}) => {
      const { candidates } = pollObj;
      const chosen_candidate = candidates.find(c => c.cand_id.equals(cand_id));
      chosen_candidate.vote_count += 1;
      return Promise.resolve(pollObj);
    }
  }

  return errs => () => Promise.reject(errs);
};

exports.listPollsMock = isResolved => {
  if (isResolved) {
    return polls => user => {
      const user_polls = polls.finds(p => p.user.equals(user));
      Promise.resolve(user_polls);
    }
  }

  return errs => () => Promise.reject(errs);
};
