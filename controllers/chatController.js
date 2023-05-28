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

  ws.on('message', async function (event) {
    const currentUser = req.currentUser;
    const eventData = JSON.parse(event);
    let broadcastData;
    switch (eventData.type) {
      case 'typing':
        broadcastData = {
          ...eventData,
          senderId: currentUser._id,
          roomId: req.params.id,
        };
        break;
      case 'seen':
        broadcastData = {
          ...eventData,
          senderId: currentUser._id,
          roomId: req.params.id,
        };
        break;
    }

    if (broadcastData) {
      publisher.publish('rooms', JSON.stringify(broadcastData));
    }
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
  console.log(formattedMsg);

  const awss = wsInstance.getWss(`/rooms/${formattedMsg.roomId}`);
  awss.clients.forEach((client) => {
    switch (formattedMsg.type) {
      case 'message':
        if (
          formattedMsg.message.sender._id !== client.currentUser._id.toString()
        ) {
          client.send(
            JSON.stringify({ eventType: 'message', eventData: formattedMsg })
          );
        }
        break;
      case 'typing':
        if (formattedMsg.receiverId === client.currentUser._id.toString()) {
          client.send(
            JSON.stringify({ eventType: 'typing', eventData: formattedMsg })
          );
        }
        break;
      case 'seen':
        if (formattedMsg.receiverId === client.currentUser._id.toString()) {
          client.send(
            JSON.stringify({ eventType: 'seen', eventData: formattedMsg })
          );
        }
        break;
      case 'reaction_created':
      case 'reaction_updated':
      case 'reaction_deleted':
        if (
          formattedMsg.reaction.user_id !== client.currentUser._id.toString()
        ) {
          client.send(
            JSON.stringify({
              eventType: formattedMsg.type,
              eventData: formattedMsg,
            })
          );
        }
        break;
    }
  });
};
