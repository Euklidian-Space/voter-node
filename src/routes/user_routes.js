const router = require("express").Router();
const UserController = require("../controllers/user_controller");

router.get("/:id", UserController.verifyToken, UserController.show);
router.post("/register", UserController.create);

module.exports = router;
