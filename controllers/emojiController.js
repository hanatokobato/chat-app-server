const catchAsync = require('../utils/catchAsync');
const Emoji = require('../models/emoji');

exports.getEmojis = catchAsync(async (req, res, next) => {
  const emojis = await Emoji.find();

  res.status(200).json({
    status: 'success',
    result: emojis.length,
    data: {
      emojis,
    },
  });
});
