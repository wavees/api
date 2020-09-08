const getToken   = require('../../helpers/tokens/get');
const createChat = require('../../helpers/chats/create');

const cache      = require('apicache');

module.exports = (token, data) => {
  return new Promise((resolve, reject) => {
    // Let's firstly check our token.
    getToken((token))
    .then((response) => {
      const user = response;

      if (user.type == "userAccount") {
        // And now let's just create new chat.
        createChat(user.uid, data)
        .then((response) => {
          // Now let's clear our chat list
          // cached information.
          cache.clear(`chatList/${token}`);

          resolve(response)
        }).catch((error) => {
          reject(error);
        });
      } else {
        reject({ status: 400, error: "InvalidToken" });
      };
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};