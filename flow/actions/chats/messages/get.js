const getMessages     = require('../../../helpers/chats/messages/getAll.js');
const getToken        = require('../../../helpers/tokens/get');

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
        checkPermission(token, cid, "readMessages")
        .then((response) => {
          const permission = response;

          if (permission.granted) {
            // And now let's get this
            // messages and return them.
            getMessages(cid, limit)
            .then((response) => {
              resolve(response);
            }).catch((error) => {
              reject(error);
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
    }).catch(() => {
      reject({ status: 400, error: "InvalidToken" });
    });
  });
};