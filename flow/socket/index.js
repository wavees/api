const events  = require('../events/index.js');

const getChats       = require('../actions/chats/getAll');
const getChat        = require('../helpers/chats/get');
const createChat     = require('../actions/chats/create');

const getInvitations = require('../actions/chats/invitations/getAll');
const useInvitation  = require('../actions/chats/invitations/use');

const randomizer = require('../helpers/randomizer');

module.exports = (socket, user) => {
  let listenTo = [];

  // @EVENT
  // chat/join
  events.on('chat/joined', (data) => {
    if (listenTo.includes(`chat/join-${data.chat}`)) {
      socket.emit('event.chat/joined', data);
    };
  });

  // ListenTo
  socket.on('listenTo', (array) => {
    listenTo = array;
    console.log("NEW LISTEN TO ARRAY");
    console.log(listenTo);
  });

  // Get Chat
  socket.on('chat', (cid) => {
    getChat(cid)
    .then((response) => {
      socket.emit('chat', response);
    }).catch((error) => {
      console.log("ERROR 0");
      console.log(error);
    });
  });

  // Get Chats
  socket.on('chats', () => {
    getChats(user.token)
    .then((response) => {
      socket.emit('chats', response);
    }).catch((error) => {
      console.log("ERROR 1");
      console.log(error);
    });
  });

  // Create Chat
  socket.on('createChat', (chat) => {
    createChat(user.token, chat)
    .then((response) => {
      socket.emit('chatCreation', response.chat);
    }).catch((error) => {
      console.log("ERROR 2");
      console.log(error);
    });
  });

  // Get Invitations
  socket.on('invitations', (cid) => {
    getInvitations(user.token, cid)
    .then((response) => {
      socket.emit('invitations', response);
    }).catch((error) => {
      console.log("ERROR 3");
      console.log(error);
    });
  });

  // Use Invite
  socket.on('useInvite', (words) => {
    useInvitation(user.token, words)
    .then((response) => {
      socket.emit('invitationUsed', response);
    }).catch((error) => {
      console.log("ERROR FUCK");
      console.log(error);
      
      socket.emit('invitationUsed', error);
    });
  });
};