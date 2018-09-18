const router = require("express").Router();
const PollController = require("../controllers/poll_controller");
const { verifyToken } = require("../controllers/user_controller");

router.get("/:id", verifyToken, PollController.getPolls);

module.exports = router;