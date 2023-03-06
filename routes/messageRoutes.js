const express = require('express');
const router = express.Router();

router.route('/').get((req, res) => {
  console.log('Get all messages.');
  res.end();
});

module.exports = router;
