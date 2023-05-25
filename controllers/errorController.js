const mongoose = require('mongoose');

module.exports = (err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    err.statusCode = 400;
    err.message = err.errors[Object.keys(err.errors)[0]].properties.message;
  } else {
    err.statusCode = err.statusCode || 500;
  }
  err.status = err.status || 'error';

  let jsonResponse = {
    status: err.status,
    message: err.message,
  };

  if (process.env.NODE_ENV === 'development') {
    jsonResponse = { ...jsonResponse, error: err, stack: err.stack };
  }

  res.status(err.statusCode).json(jsonResponse);
};
