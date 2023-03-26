const catchAsync = require('../utils/catchAsync');
const ChatRoom = require('../models/chatRoom');

exports.getRooms = catchAsync(async (req, res, next) => {
  const rooms = await ChatRoom.find();

  res.status(200).json({
    status: 'success',
    result: rooms.length,
    data: {
      rooms,
    },
  });
});
