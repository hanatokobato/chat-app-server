const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const reactionController = require('./../controllers/reactionController');

router.route('/').put(authController.protect, reactionController.react);

module.exports = router;
