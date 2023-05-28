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

      req.publisher.publish(
        'rooms',
        JSON.stringify({
          roomId: reaction.message.room._id,
          reaction: {
            message_id: reaction.message._id,
            emoji_id: reaction.emoji._id,
            user_id: reaction.user._id,
          },
          type: 'reaction_deleted',
        })
      );
    } else {
      reaction.emoji = req.body.emoji_id;
      await reaction.save();

      req.publisher.publish(
        'rooms',
        JSON.stringify({
          roomId: reaction.message.room._id,
          reaction: {
            message_id: reaction.message._id,
            emoji_id: reaction.emoji._id,
            user_id: reaction.user._id,
          },
          type: 'reaction_updated',
        })
      );
    }
  } else {
    let createdReaction = await Reaction.create({
      message: req.body.msg_id,
      user: req.body.user_id,
      emoji: req.body.emoji_id,
    });
    createdReaction = await Reaction.findById(createdReaction._id);

    req.publisher.publish(
      'rooms',
      JSON.stringify({
        roomId: createdReaction.message.room._id,
        reaction: {
          message_id: createdReaction.message._id,
          emoji_id: createdReaction.emoji._id,
          user_id: createdReaction.user._id,
        },
        type: 'reaction_created',
      })
    );
  }

  res.status(204).json({
    status: 'success',
  });
});
