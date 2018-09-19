const { to } = require("await-to-js");

exports.actions = repo => {
  const { createPoll, castVote, listUserPolls } = repo;

  const create = async (req, res, next) => {
    const [err, poll] = await to(createPoll(req.body));
    if (err) {
      return next(err);
    }

    res.status(200).send(poll);
    return poll;
  };

  const vote = async (req, res, next) => {
    const {poll_id, cand_name} = req.body;
    const [err, poll] = await to(castVote({poll_id, cand_name}));
    if (err) return next(err);

    res.status(200).send(poll);
    return Promise.resolve(poll);
  };


  return {
    create, 
    vote
  };
};
