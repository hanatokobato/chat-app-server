const Message = require('../models/message');

exports.joinRoom = function (ws, req, { wsInstance }) {
  const awss = wsInstance.getWss(`/rooms/${req.params.id}`);
  const publisher = req.publisher;
  ws.currentUser = req.currentUser;
  ws.roomId = req.params.id;
  const users = [];
  awss.clients.forEach((client) => {
    if (
      client.currentUser._id === req.currentUser._id ||
      client.roomId !== req.params.id
    )
      return;

    client.send(
      JSON.stringify({
        eventType: 'joining',
        eventData: { user: req.currentUser },
      })
    );
    users.push(client.currentUser);
  });
  ws.send(JSON.stringify({ eventType: 'users', eventData: { users } }));

  ws.on('message', async function (msg) {
    const currentUser = req.currentUser;
    const message = await Message.create({
      message: msg,
      sender: {
        name: currentUser.name,
        _id: currentUser._id,
      },
    });
    publisher.publish(
      'rooms',
      JSON.stringify({ roomId: req.params.id, message })
    );
  });
  ws.on('close', async function (code, reason) {
    awss.clients.forEach((client) => {
      if (client.currentUser._id === req.currentUser._id) return;

      client.send(
        JSON.stringify({
          eventType: 'leaving',
          eventData: { user: req.currentUser },
        })
      );
    });
  });
};

exports.broadcastRoom = function (message, { wsInstance }) {
  const formattedMsg = JSON.parse(message);

  const awss = wsInstance.getWss(`/rooms/${formattedMsg.roomId}`);
  awss.clients.forEach((client) => {
    if (formattedMsg.message.sender._id !== client.currentUser._id.toString())
      client.send(
        JSON.stringify({ eventType: 'message', eventData: formattedMsg })
      );
  });
};
