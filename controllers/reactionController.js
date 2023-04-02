const catchAsync = require('../utils/catchAsync');
const Reaction = require('../models/reaction');

exports.react = catchAsync(async (req, res, next) => {
  const reaction = await Reaction.findOne({
    message: req.body.msg_id,
    user: req.body.user_id,
  });

  if (reaction) {
    if (reaction.emoji._id.toString() === req.body.emoji_id) {
      await reaction.deleteOne();
    } else {
      reaction.emoji = req.body.emoji_id;
      await reaction.save();
    }
  } else {
    await Reaction.create({
      message: req.body.msg_id,
      user: req.body.user_id,
      emoji: req.body.emoji_id,
    });
  }

  res.status(204).json({
    status: 'success',
  });
});
