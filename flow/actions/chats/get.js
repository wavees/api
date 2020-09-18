const getToken = require('../../helpers/tokens/get');
const getChat  = require('../../helpers/chats/get');

const getSettings = require('../../helpers/chats/settings/user.js');

module.exports = (token, cid) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get some information about
    // this token.
    getToken(token)
    .then((response) => {
      const token = response;

      console.log("GET CHAT: TOKEN:");
      console.log(token);

      if (token.type == "userAccount") {
        // And now let's get some information about
        // this chat and its members.
        getChat(cid)
        .then((response) => {
          const chat = response;

          if (chat.members.includes(token.uid)) {
            // And now let's get user-specific
            // chat settings.
            getSettings(0, 0)
            .then((settings) => {
              chat.settings.user = settings;
              resolve(chat);
            }).catch(() => {
              reject({ status: 500, error: "ServerError" });
            });
          } else {
            reject({ status: 400, error: "InsufficientPermission" });
          };
        }).catch((error) => {
          reject(error);
        });
      } else {
        reject({ status: 400, error: "InvalidToken" });
      };
    }).catch((error) => {
      reject(error);
    });
  });
};