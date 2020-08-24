const events  = require('../events/index.js');
const actions = { 
  getData: require('./actions/getData')
};

module.exports = (socket) => {
  // Small object, that'll determine
  // things, that our socket wants
  // to listen to.
  let settings = {
    uid: null,
    listenTo: []
  };

  // @action getData 
  socket.on('getData', (e) => {
    actions.getData(e)
    .then((response) => {
      socket.emit(response.dataType, response);
    });
  });

  // @action Settings
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