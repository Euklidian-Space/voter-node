const { to } = require("await-to-js");
const { createPoll, castVote, listPolls } = require("../../contexts/CMS");

exports.create = async (req, res, next) => {
  const [err, poll] = await to(createPoll(req.body));
  if (err) {
    return next(err);
  }

  res.status(200).send(poll);
  return poll;
};

exports.vote = async (req, res, next) => {
  const [err, poll] = await to(castVote(req.body));
  if (err) return next(err);

  res.status(200).send(poll);
  return Promise.resolve(poll);
};

exports.getPolls = async (req, res, next) => {
  const { user } = req.body;
  const [err, polls] = await to(listPolls(user));
  if (err) return next(err);

  res.status(200).send(polls);
  return Promise.resolve(polls);
};

