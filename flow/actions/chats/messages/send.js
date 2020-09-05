const createMessage   = require('../../../helpers/chats/messages/create');
const getToken        = require('../../../helpers/tokens/get');

const checkPermission = require('../../../helpers/chats/permissions/check');

module.exports = (token, cid, message) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get this user's token...
    getToken(token)
    .then((response) => {
      // Let's firstly check this token type.
      if (response.type == "userAccount") {
        // And now let's check if this user can 
        const user = response;
        checkPermission(token, cid, "sendMessage")
        .then((response) => {
          const permission = response;

          if (permission.granted) {
            // Let's firtly prepare our
            // author object.
            const author = {
              type: "user",
              uid: user.uid
            };

            // Let's now prepare our message
            // object. 
            const msg = {
              type: "plain",
              content: message.content
            };

            createMessage(cid, author, msg)
            .then((response) => {
              resolve(response);
            }).catch((error) => {
              reject(error);
            });
          } else {
            reject({ status: 400, error: "InsufficientPermission" });
          };
        }).catch((error) => {
          console.log(error);
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