const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const AppError = require('../utils/appError');
const { cloudinaryStorage } = require('../utils/cloudinary');

const multerStorage =
  process.env.NODE_ENV === 'production'
    ? cloudinaryStorage
    : multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Your file format is not supported! Please upload only images.'
      ),
      false
    );
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file || process.env.NODE_ENV !== 'development') return next();

  req.file.filename = `user-${req.currentUser._id}-${Date.now()}.jpeg`;

  if (!fs.existsSync(`files/img/users`)) {
    fs.mkdirSync(`files/img/users`, { recursive: true });
  }
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`files/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.updateUser = catchAsync(async (req, res) => {
  const filteredBody = filterObj(req.body, 'name');
  if (req.file)
    filteredBody.photo =
      process.env.NODE_ENV === 'production' ? req.file.path : req.file.filename;

  console.log(req.file);
  const updatedUser = await User.findByIdAndUpdate(
    req.currentUser._id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
