const express = require('express');
const authController = require('../controller/authController');
const router = express.Router(); //Instance of router

router.post('/login',authController.login);
router.post('/logout',authController.logout);
router.post('/is-user-logged-in',authController.isUserLoggedIn);

module.exports = router;
