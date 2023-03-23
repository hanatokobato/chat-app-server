const catchAsync = require('../utils/catchAsync');
const Message = require('../models/message');

exports.getMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find();

  res.status(200).json({
    status: 'success',
    result: messages.length,
    data: {
      messages,
    },
  });
});
