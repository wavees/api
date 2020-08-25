const axios     = require('axios');
const config    = require('config');
const moment    = require('moment');

const addMember = require('./members/add');

module.exports = (uid, data) => {
  return new Promise((resolve, reject) => {
    // And now let's prepare our chat information
    // and create new chat...
    const chat = {
      $$storage: "flow-chats",

      ownerId: uid,
      name: data.name,

      creationDate: moment().unix(),
      avatar: data.avatar,

      members: [uid]
    };

    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, chat)
    .then((response) => {
      // And now let's add this user to
      // this chat...
      addMember(response.data.document._id, uid)
      .then((response) => {
        resolve({
          membership: response,
          chat: chat
        });
      }).catch(() => {
        reject({ status: 500, error: "ServerError" });
      });
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};