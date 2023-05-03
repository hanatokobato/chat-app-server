const catchAsync = require('../utils/catchAsync');
const ChatRoom = require('../models/chatRoom');

exports.getRooms = catchAsync(async (req, res, next) => {
  const rooms = await ChatRoom.find({
    name: {
      $regex: req.query.search,
      $options: 'i',
    },
  });

  res.status(200).json({
    status: 'success',
    result: rooms.length,
    data: {
      rooms,
    },
  });
});

exports.roomDetail = catchAsync(async (req, res, next) => {
  const room = await ChatRoom.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      room,
    },
  });
});
