const express = require("express");
const authController = require("../controller/authController");
const router = express.Router(); //Instance of router
const { body } = require("express-validator");
const loginValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isEmail()
    .withMessage("Username must be a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is Required")
    .isLength({ min: 4 })
    .withMessage("Password must be atleast 4 characters long"),
];

router.post("/login", loginValidator, authController.login);
router.post("/logout", authController.logout);
router.post("/is-user-logged-in", authController.isUserLoggedIn);
router.post("/register", authController.register);
router.post("/google-auth", authController.googleAuth);
router.post(
  "/send-reset-password-token",
  authController.sendResetPasswordToken
);
router.post("/reset-password", authController.resetPassword);
module.exports = router;
