const express = require('express');
const router = express.Router();
const emojiController = require('./../controllers/emojiController');

router.route('/').get(emojiController.getEmojis);

module.exports = router;
