const getToken = require('../../helpers/tokens/get');
const getChat  = require('../../helpers/chats/get');

module.exports = (token, cid) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get some information about
    // this token.
    getToken(token)
    .then((response) => {
      const token = response;

      if (token.type == "userAccount") {
        // And now let's get some information about
        // this chat and its members.
        getChat(cid)
        .then((response) => {
          const chat = response;

          if (chat.members.includes(token.uid)) {
            resolve(chat);
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