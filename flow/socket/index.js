const events  = require('../events/index.js');
const actions = { 
  getData: require('./actions/getData')
};

const randomizer = require('../helpers/randomizer');

module.exports = (socket) => {
  // Small object, that'll determine
  // things, that our socket wants
  // to listen to.
  let settings = {
    authorized: false,

    uid: null,
    listenTo: []
  };

  socket.on('authorize', (data) => {
    // Let's try to authorize our socket...
    actions.getData({ type: "account", token: data.token })
    .then((response) => {
      const user = response.response;

      if (user.uid != null) {
        // Let's now save user's uid...
        settings.authorized = true;
        settings.uid        = user.uid;
        
        // And now let's reply with user
        // information...
        events.emit('socketResponse', {
          uid: user.uid,
          data: response
        });
      };
    });
  });

  socket.on('register', (data) => {
    // Let's try to register our user...
    actions.getData({ type: "createAccount", user: data })
    .then((response) => {
      const user = response.response.user;

      if (user.uid != null) {
        settings.authorized = true;
        settings.uid        = user.uid;

        // And now let's reply with
        // our new user information.
        events.emit('socketResponse', {
          uid: user.uid,
          data: response
        })
      };
    });
  });

  // @action getData 
  socket.on('getData', (data) => {
    if (!settings.authorized) return;

    actions.getData(data)
    .then((response) => {
      if (response.private) {
        socket.emit(response.dataType, response);
      } else {
        events.emit('socketResponse', {
          uid: settings.uid,
          data: response
        });
      };
    });
  });

  events.on('socketResponse', (data) => {
    console.log(data.uid);
    console.log(settings.uid);
    if (data.uid = settings.uid) {
      socket.emit(data.data.dataType == null ? "socketResponse" : data.data.dataType, { response: data.data.response });
    };
  });
};