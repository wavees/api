const getMessages     = require('../../../helpers/chats/messages/getAll.js');
const getToken        = require('../../../helpers/tokens/get');

const getChat         = require('../../../helpers/chats/get');

const checkPermission = require('../../../helpers/chats/permissions/check');

module.exports = (token, cid, limit = 50) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get this token's
    // information.
    getToken(token)
    .then((response) => {
      // And now let's check this user's
      // permissions and so on.
      if (response.type == "userAccount") {
        const user = response;

        // Now we need to check if this user
        // is a member of this chat.

        getChat(cid)
        .then((response) => {
          const chat = response;

          if (!chat.members.includes(user.uid)) {
            reject({ status: 400, error: "InsufficientPermission" });
          } else {
            checkPermission(token, cid, "readMessages")
            .then((response) => {
              const permission = response;
    
              if (permission.granted) {
                // And now let's get this
                // messages and return them.
                getMessages(cid, limit)
                .then((response) => {
                  // By the way, let's sort them.
                  resolve(response.sort((a, b) => { return a.sent - b.sent }));
                }).catch((error) => {
                  reject(error);
                });
              } else {
                reject({ status: 400, error: "InsufficientPermission" });
              };
            }).catch((error) => {
              reject(error);
            });
          };
        }).catch((error) => {
          reject(error);
        });
      } else {
        reject({ status: 400, error: "InvalidToken" });
      };
    }).catch(() => {
      reject({ status: 400, error: "InvalidToken" });
    });
  });
};