const express = require('express');
const expressWs = require('express-ws');
const app = express();
const wsInstance = expressWs(app);
const redis = require('redis');
const publisher = redis.createClient({
  url: 'redis://redis:6379',
});
const subscriber = publisher.duplicate();
publisher.connect();
subscriber.connect();

app.get('/chat', (req, res, next) => {
  console.log(req.query);
  res.end();
});

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

app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});
