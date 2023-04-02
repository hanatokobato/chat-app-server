const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ChatRoom = require('../models/chatRoom');
const User = require('../models/userModel');
const Message = require('../models/message');
const Emoji = require('../models/emoji');

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const chatRooms = JSON.parse(
  fs.readFileSync(`${__dirname}/rooms.json`, 'utf-8')
);
const emojis = JSON.parse(fs.readFileSync(`${__dirname}/emojis.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await ChatRoom.create(chatRooms);
    await Emoji.create(emojis);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await ChatRoom.deleteMany();
    await Message.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
