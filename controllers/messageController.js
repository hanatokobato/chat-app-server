const catchAsync = require('../utils/catchAsync');

exports.getMessages = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    result: 10,
    data: {
      users,
    },
  });
});
