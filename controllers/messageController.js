const catchAsync = require('../utils/catchAsync');
const Message = require('../models/message');
const User = require('../models/userModel');
const ObjectId = require('mongoose').Types.ObjectId;

exports.getMessages = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.perPage || 10;
  const skip = (page - 1) * limit;

  let messages;
  let totalMessage;
  if (ObjectId.isValid(req.query.room)) {
    totalMessage = await Message.find({
      'room._id': req.query.room,
    }).countDocuments();
    if (skip > totalMessage) throw new Error('This page does not exist.');

    messages = await Message.find({
      'room._id': req.query.room,
    })
      .populate('reactions')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
  } else {
    const participants = req.query.room.split('__');
    const target = participants.find(
      (p) => p !== req.currentUser._id.toString()
    );

    totalMessage = await Message.find({
      $or: [
        {
          'sender._id': req.currentUser._id,
          'receiver._id': target,
        },
        {
          'sender._id': target,
          'receiver._id': req.currentUser._id,
        },
      ],
    }).countDocuments();
    if (skip > totalMessage) throw new Error('This page does not exist.');

    messages = await Message.find({
      $or: [
        {
          'sender._id': req.currentUser._id,
          'receiver._id': target,
        },
        {
          'sender._id': target,
          'receiver._id': req.currentUser._id,
        },
      ],
    })
      .populate('reactions')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);
  }

  res.status(200).json({
    status: 'success',
    result: totalMessage,
    currentPage: page,
    perPage: limit,
    lastPage: Math.ceil(totalMessage / limit),
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
    const receiver = await User.findById(req.body.receiver);

    attr.receiver = {
      _id: receiver._id,
      name: receiver.name,
    };
  }

  const createdMessage = await Message.create(attr);
  req.publisher.publish(
    'rooms',
    JSON.stringify({ roomId: createdMessage.room._id, message: createdMessage })
  );

  res.status(201).json({
    status: 'success',
    data: {
      message: createdMessage,
    },
  });
});
