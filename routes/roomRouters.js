const express = require('express');
const router = express.Router();
const roomController = require('./../controllers/roomController');
const authController = require('./../controllers/authController');

router.route('/').get(authController.protect, roomController.getRooms);
router.route('/:id').get(authController.protect, roomController.roomDetail);

module.exports = router;
