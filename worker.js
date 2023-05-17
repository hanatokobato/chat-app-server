const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const mongoose = require('mongoose');
const Queue = require('bull');
const Message = require('./models/message');

const DB =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'));

const workQueue = new Queue('userPhotoUpdating', process.env.REDIS_URL);

workQueue.process(async function (job, done) {
  // job.data contains the custom data passed when the job was created
  // job.id contains id of this job.
  console.log(job.data);
  const { userId, photo } = job.data;

  await Message.updateMany(
    {
      'sender._id': userId,
    },
    { 'sender.photo': photo }
  );

  done();
});
