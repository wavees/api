const getToken        = require('../../../helpers/tokens/get');
const getChat         = require('../../../helpers/chats/get');
const checkPermission = require('../../../helpers/chats/permissions/check');

module.exports = (token, cid, permission) => {
  return new Promise((resolve, reject) => {
    getToken(token)
    .then((response) => {
      const token = response;

      if (token.type == "userAccount") {
        // Let's fistly get some information about this
        // chat...
        getChat(cid)
        .then((response) => {
          const chat = response;

          if (chat.ownerId == token.uid) {
            resolve({
              type: "permission",

              uid: token.uid, cid,

              permission,
              granted: true
            });
          } else {
            // And now let's check this permission...
            checkPermission(token.uid, cid, permission)
            .then((response) => {
              resolve(response);
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
    }).catch((error) => {
      reject(error);
    });
  });
};