const axios   = require('axios');
const config  = require('config');
const events  = require('../../events/index');

const getChat = require('./get');

module.exports = (cid, object) => {
  return new Promise((resolve, reject) => {
    getChat(cid)
    .then((response) => {
      let query = {
        $$storage: "flow-chats",

        _id: cid
      };

      let chat = response;

      chat.name = object.name || chat.name;

      // And now let's update our chat
      axios.put(`${config.get('nodes.main.url')}/update/${config.get('nodes.main.key')}/${JSON.stringify(query)}`, chat)
      .then(() => {
        events.emit('chat/changed', chat);

        resolve(chat);
      }).catch((error) => {
        reject({ status: 500, error: "ServerError" });
      });
    }).catch((error) => {
      reject(error);
    });
  });
};