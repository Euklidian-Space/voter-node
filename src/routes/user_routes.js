const router = require("express").Router();
const UserController = require("src/controllers/user_controller");
const AuthController = require("src/controllers/auth_controller");

function userRouter(context) {
  const {
    show,
    create,
    login,
    getPolls
  } = UserController.actions(context);

  router.get("/:id", AuthController.verifyToken, show);
  router.get("/:id/polls", AuthController.verifyToken, getPolls)
  router.post("/register", create);
  router.post("/login", login);

  return router;
}


module.exports = userRouter;
