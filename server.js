const express = require('express');
const expressWs = require('express-ws');
// const redis = require('redis');
// const publisher = redis.createClient();

const app = express();
expressWs(app);

app.get('/chat', (req, res, next) => {
  console.log(req.query);
  res.end();
});

// ws

app.ws('/chat', function(ws, req) {
  ws.on('message', function(msg) {
    console.log('msg');
  });
  console.log('socket', req.testing);
});


app.listen(3000, () => {
  console.log(`App running on port 3000...`);
});


// (async () => {

//   const message = {
//     id: '123456',
//     message: 'Using Redis Pub/Sub with Node.js',
//     user_id: 1,
//     created_at: new Date(),
//   };

//   await publisher.connect();

//   await publisher.publish('messages', JSON.stringify(message));

//   const subscriber = client.duplicate();

//   await subscriber.connect();

//   await subscriber.subscribe("article", (message) => {
//     console.log(message); // 'message'
//   });
// })();
