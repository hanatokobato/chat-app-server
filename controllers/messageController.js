const catchAsync = require('../utils/catchAsync');
const Message = require('../models/message');

exports.getMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({
    'room._id': req.query.room,
  }).populate('reactions');

  res.status(200).json({
    status: 'success',
    result: messages.length,
    data: {
      messages,
    },
  });
});

exports.createMessage = catchAsync(async (req, res, next) => {
  const attr = {
    message: req.body.message,
    sender: {
      _id: req.currentUser._id,
      name: req.currentUser.name,
    },
    room: {
      _id: req.body.room,
    },
  };
  if (req.body.receiver) {
    attr.receiver = {
      _id: req.body.receiver._id,
      name: req.body.receiver.name,
    };
  }

  const createdMessage = await Message.create(attr);

  res.status(201).json({
    status: 'success',
    data: {
      message: createdMessage,
    },
  });
});
