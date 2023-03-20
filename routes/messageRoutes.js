const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');

router.route('/').get(authController.protect, (req, res) => {
  console.log('Get all messages.');
  res.end();
});

module.exports = router;
