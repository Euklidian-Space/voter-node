const router = require("express").Router();
const UserController = require("../controllers/user_controller");

router.get("/:id", UserController.show);

module.exports = router;
