const router = require("express").Router();
const UserController = require("../controllers/user_controller");

function userRouter(context) {
  const {
    show,
    create,
    login
  } = UserController.actions(context);

  router.get("/:id", UserController.verifyToken, show);
  router.post("/register", create);
  router.post("/login", login);

  return router;
}


module.exports = userRouter;
