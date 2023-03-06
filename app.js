const express = require('express');
const expressWs = require('express-ws');
const morgan = require('morgan');

const messageRoutes = require('./routes/messageRoutes');

const app = express();
const wsInstance = expressWs(app);
const redis = require('redis');

const publisher = redis.createClient({
  url: 'redis://redis:6379',
});
const subscriber = publisher.duplicate();
publisher.connect();
subscriber.connect();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.ws('/chat', async function (ws, req) {
  await subscriber.subscribe('messages', (message) => {
    console.log(message);
    const awss = wsInstance.getWss('/chat');
    awss.clients.forEach((client) => {
      client.send(message);
    });
  });

  ws.on('message', async function (msg) {
    console.log('msg');
    const message = {
      id: '123456',
      message: msg,
      user_id: 1,
      timestamp: new Date(),
    };
    await publisher.publish('messages', JSON.stringify(message));
  });
});

app.use('/messages', messageRoutes);

module.exports = app;
