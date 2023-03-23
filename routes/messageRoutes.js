const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const messageController = require('./../controllers/messageController');

router.route('/').get(authController.protect, messageController.getMessages);

module.exports = router;
