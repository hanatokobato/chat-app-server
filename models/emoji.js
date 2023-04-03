const mongoose = require('mongoose');

const emojiSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Emoji = mongoose.model('Emoji', emojiSchema);

module.exports = Emoji;
