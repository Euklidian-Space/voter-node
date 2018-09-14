const router = require("express").Router();
const UserController = require("../controllers/user_controller");

router.get("/:id", UserController.verifyToken, UserController.show);
router.post("/register", UserController.create);
router.post("/login", UserController.login);

module.exports = router;
