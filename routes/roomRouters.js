const express = require('express');
const router = express.Router();
const roomController = require('./../controllers/roomController');
const authController = require('./../controllers/authController');

router.route('/').get(authController.protect, roomController.getRooms);

module.exports = router;
