const express = require('express');
const expressWs = require('express-ws');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const messageRouter = require('./routes/messageRoutes');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const { wsProtect } = require('./controllers/authController');

const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3001',
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cookieParser());

const wsInstance = expressWs(app, null, {
  wsOptions: {
    verifyClient: wsProtect,
  },
});
const redis = require('redis');
const errorController = require('./controllers/errorController');

const publisher = redis.createClient({
  url: 'redis://redis:6379',
});
const subscriber = publisher.duplicate();
publisher.connect();
subscriber.connect();

subscriber.subscribe('messages', (message) => {
  console.log(message);
  const awss = wsInstance.getWss('/chat');
  awss.clients.forEach((client) => {
    client.send(message);
  });
});

app.ws('/chat', function (ws, req) {
  ws.on('message', async function (msg) {
    const currentUser = req.currentUser;
    const message = {
      id: currentUser._id,
      message: msg,
      user_id: currentUser._id,
      user_name: currentUser.name,
      timestamp: new Date(),
    };
    await publisher.publish('messages', JSON.stringify(message));
  });
});

app.use('/api/v1', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/messages', messageRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
