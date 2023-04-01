const Message = require('../models/message');

exports.joinChat = function (ws, req) {
  const publisher = this.publisher;
  ws.on('message', async function (msg) {
    const currentUser = req.currentUser;
    const message = await Message.create({
      message: msg,
      sender: {
        name: currentUser.name,
        _id: currentUser._id,
      },
    });
    publisher.publish('messages', JSON.stringify(message));
  });
};

exports.broadcastMessage = function (message) {
  const wsInstance = this.wsInstance;
  const awss = wsInstance.getWss('/chat');
  awss.clients.forEach((client) => {
    client.send(message);
  });
};
