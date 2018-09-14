const router = require("express").Router();
const PollController = require("../controllers/poll_controller");

router.get("/:id", PollController.getPolls);

module.exports = router;