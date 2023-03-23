const mongoose = require('mongoose');
const validator = require('validator');

const messageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    user: {
      name: {
        type: String,
        required: true,
      },
      _id: {
        type: mongoose.ObjectId,
        required: true,
      },
    },
    room: {
      _id: mongoose.ObjectId,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
