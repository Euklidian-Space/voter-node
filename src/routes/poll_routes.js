const router = require("express").Router();
const PollController = require("src/controllers/poll_controller");
const { verifyToken } = require("src/controllers/auth_controller");

function pollRouter(context) {
  const {
    create,
    vote
  } = PollController.actions(context);

  router.post("/", verifyToken, create);
  router.post("/vote", verifyToken, vote);

  return router;
}


module.exports = pollRouter;