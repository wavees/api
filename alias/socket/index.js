const events = require('../events/index.js');

module.exports = (socket) => {
  // Small object, that'll determine
  // things, that our socket wants
  // to listen to.
  let settings = {
    uid: null,
    listenTo: []
  };

  // 
  socket.on('settings', (e) => {
    settings = e;
  });

  // And now let's listene to
  // our events.
  events.on("socketEvent", (event) => {
    if (settings.listenTo.includes(event.event)) {
      // Let's now check current Author ID;
      if (settings.uid == null ? event.aid : settings.uid == event.aid) {
        socket.emit(event.event, event);
      };
    };
  });
};