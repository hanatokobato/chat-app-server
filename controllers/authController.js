const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and Password are required!', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  const isValidPassword = await user?.isValidPassword(password, user.password);
  if (!user || !isValidPassword) {
    return next(new AppError('Incorrect Email or Passowrd!', '401'));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('Please log in and try again!', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError('The token is invalid!', 401));

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password changed! Please log in again.', 401));
  }

  req.currentUser = currentUser;
  next();
});

exports.wsProtect = async (info, cb) => {
  let token;
  if (
    info.req.headers.authorization &&
    info.req.headers.authorization.startsWith('Bearer')
  ) {
    token = info.req.headers.authorization.split(' ')[1];
  } else if (info.req.headers.cookie) {
    info.req.headers.cookie.split(';').forEach(function (cookie) {
      const parts = cookie.match(/(.*?)=(.*)$/);
      const name = parts[1].trim();
      const value = (parts[2] || '').trim();
      if (name === 'jwt') {
        token = value;
      }
    });
  }

  if (!token) return cb(false, 401, 'Unauthorized');

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return cb(false, 401, 'Unauthorized');

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return cb(false, 401, 'Unauthorized');
  }

  info.req.currentUser = currentUser;
  cb(true);
};
