const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  message: {
    type: mongoose.ObjectId,
    ref: 'Message',
    required: true,
  },
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true,
  },
  emoji: {
    type: mongoose.ObjectId,
    ref: 'Emoji',
    required: true,
  },
});

reactionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  }).populate({
    path: 'emoji',
    select: 'name',
  });

  next();
});

const Reaction = mongoose.model('Reaction', reactionSchema);

module.exports = Reaction;
