const { to } = require("await-to-js");
const { createPoll, castVote, listUserPolls } = require("../../contexts/CMS");

exports.create = async (req, res, next) => {
  const [err, poll] = await to(createPoll(req.body));
  if (err) {
    return next(err);
  }

  res.status(200).send(poll);
  return poll;
};

exports.vote = async (req, res, next) => {
  const {poll_id, cand_name} = req.body;
  const [err, poll] = await to(castVote({poll_id, cand_name}));
  if (err) return next(err);

  res.status(200).send(poll);
  return Promise.resolve(poll);
};

exports.getPolls = async (req, res, next) => {
  const { id } = req.params;
  const [err, polls] = await to(listUserPolls(id));
  console.log("err: ", err)
  if (err) return next(err);

  res.status(200).send({ polls });
  return Promise.resolve(polls);
};

