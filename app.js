const express = require('express');
const expressWs = require('express-ws');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const redis = require('redis');

const AppError = require('./utils/appError');
const messageRouter = require('./routes/messageRoutes');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const roomRouter = require('./routes/roomRouters');
const emojiRouter = require('./routes/emojiRoutes');
const reactionRouter = require('./routes/reactionRoutes');
const { wsProtect } = require('./controllers/authController');
const errorController = require('./controllers/errorController');
const { broadcastRoom, joinRoom } = require('./controllers/chatController');

const publisher = redis.createClient({
  url: process.env.REDIS_URL,
});
const subscriber = publisher.duplicate();
publisher.connect();
subscriber.connect();

const app = express();
const wsInstance = expressWs(app, null, {
  wsOptions: {
    verifyClient: wsProtect,
  },
});

app.use((req, res, next) => {
  req.wsInstance = wsInstance;
  req.publisher = publisher;
  req.subscriber = subscriber;

  next();
});
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  })
);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser());

subscriber.subscribe('rooms', (message) =>
  broadcastRoom(message, { wsInstance })
);
app.ws(`/rooms/:id`, (ws, req) => {
  joinRoom(ws, req, { wsInstance });
});

app.use('/api/v1', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/emojis', emojiRouter);
app.use('/api/v1/reactions', reactionRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
