const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sender: {
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
    receiver: {
      name: {
        type: String,
      },
      _id: {
        type: mongoose.ObjectId,
      },
    },
    seenAt: {
      type: Date,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

messageSchema.virtual('reactions', {
  ref: 'Reaction',
  foreignField: 'message',
  localField: '_id',
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
