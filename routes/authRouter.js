const Router = require("express");
const router = new Router();
const controller = require("../controlers/authController");
const { check } = require("express-validator");
router.post(
  "/registration",
  [
    check("mail", "Email can't be empty").notEmpty(),
    check("name", "Name can't be empty").notEmpty(),
    check(
      "password",
      "Password need to be bigger than 4 and less than 20 symbols",
    ).isLength({ min: 4, max: 20 }),
  ],
  controller.registration,
);
router.post(
  "/login",
  [
    check("mail", "Email can't be empty").notEmpty(),
    check("password", "Password can't be empty").notEmpty(),
  ],

  controller.login,
);

module.exports = router;
