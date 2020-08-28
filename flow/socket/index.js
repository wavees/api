const events  = require('../events/index.js');

const getChats       = require('../actions/chats/getAll');
const getChat        = require('../actions/chats/get');
const createChat     = require('../actions/chats/create');

const getInvitations = require('../actions/chats/invitations/getAll');
const useInvitation  = require('../actions/chats/invitations/use');

const randomizer = require('../helpers/randomizer');

module.exports = (socket, user) => {
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
    console.log("GET INVITATIONS");
    console.log(user);
    
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