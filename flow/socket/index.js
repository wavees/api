const events  = require('../events/index.js');

const getChats        = require('../actions/chats/getAll');
const getChat         = require('../helpers/chats/get');
const createChat      = require('../actions/chats/create');

const getInvitations  = require('../actions/chats/invitations/getAll');
const useInvitation   = require('../actions/chats/invitations/use');

const checkPermission = require('../actions/chats/permissions/check');

const changeName      = require('../actions/chats/changeName');

const sendMessage     = require('../actions/chats/messages/send');
const getMessages     = require('../actions/chats/messages/get');

module.exports = (socket, user) => {
  let listenTo = [];

  // ListenTo
  socket.on('listenTo', (array) => {
    listenTo = array;
  });

  // @EVENT
  // chat/join
  events.on('chat/joined', (data) => {
    if (listenTo.includes(`chat/join-${data.chat}`)) {
      socket.emit('event.chat/joined', data);
    };
  });

  // @EVENT
  // chat/changed
  events.on("chat/changed", (chat) => {
    if (listenTo.includes(`chat/change-${chat.id}`)) {
      socket.emit('event.chat/changed', chat);
    };
  });

  // @EVENT
  // chat/create
  events.on("chat/created", (chat) => {
    console.log(listenTo);

    if (listenTo.includes(`chat/creation`) && chat.ownerId == user.uid) {
      console.log("YEAH, SEND");
      socket.emit('event.chat/created', chat);
    };
  });

  // @EVENT
  // chat/sentMessage
  events.on("chat/sentMessage", (cid, message, type) => {
    if (listenTo.includes(`chat/messages-${cid}`)) {
      socket.emit('event.chat/message', { cid, message, type });
    };
  });

  // Send Message
  socket.on('sendMessage', (cid, message) => {
    // Let's firstly check this message's 
    // content.
    if (message.content != null) {
      // And now let's 
      events.emit('chat/sentMessage', cid, {
        author: {
          type: "user",
          uid: user.uid
        },  
        message
      }, "fastMessage");
    };

    sendMessage(user.token, cid, message)
  });
};