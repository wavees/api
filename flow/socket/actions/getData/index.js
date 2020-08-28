const createAccount  = require('../../../actions/account/create');
const getAccount     = require('../../../actions/account/get');

const getChats       = require('../../../actions/chats/getAll');
const getChat        = require('../../../actions/chats/get');
const createChat     = require('../../../actions/chats/create');

const getInvitations = require('../../../actions/chats/invitations/getAll');
const useInvitation  = require('../../../actions/chats/invitations/use');

module.exports = (data) => {
  return new Promise((resolve, reject) => {
    // Let's now check this data type.

    console.log("REQUEST DATA:");
    console.log(data);

    // @type account
    if (data.type == "account") {
      getAccount(data.token)
      .then((response) => {
        resolve({ dataType: "account", response, private: true });
      }).catch((error) => {
        resolve({ dataType: "account", error: error.response.data });
      });
    // @type createAccount
    } else if (data.type == "createAccount") {
      createAccount(data.user)
      .then((response) => {
        resolve({ dataType: "accountCreation", response, private: true });
      }).catch((error) => {
        resolve({ dataType: "accountCreation", error: error.response.data });
      });
    // @type chats 
    } else if (data.type == "chats") {
      getChats(data.token)
      .then((response) => {
        resolve({ dataType: "chats", response, private: true });
      }).catch((error) => {
        resolve({ dataType: "chats", error: error.response.data });
      });
    // @type chat
    } else if (data.type == "chat") {
      getChat(data.token, data.cid)
      .then((response) => {
        resolve({ dataType: "chat", response, private: true });
      }).catch((error) => {
        resolve({ dataType: "chat", error: error.response.data });
      });
    // @type createChat
    } else if (data.type == "createChat") {
      createChat(data.token, data.chat)
      .then((response) => {
        // And now let's update our chats list.
        resolve({ dataType: "createChat", response: response, private: true });
      }).catch((error) => {
        resolve({ dataType: "createChat", error: error.response.data });
      });
    // Get Invitations
    } else if (data.type == "invitations") {
      getInvitations(data.token, data.cid)
      .then((response) => {
        resolve({ dataType: "invitations", response, private: true });
      }).catch((error) => {
        resolve({ dataType: "invitations", error: error.response.data });
      });
    // Use Invitation
    } else if (data.type == "useInvite") {
      useInvitation(data.token, data.words)
      .then((response) => {
        // And now let's update our chats list.
        resolve({ dataType: "useInvite", response: response, private: true });
      }).catch((error) => {
        resolve({ dataType: "useInvite", error: error.response.data });
      });
    };
  });
};