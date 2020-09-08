const getToken         = require('../../helpers/tokens/get');
const checkPermission  = require('./permissions/check');
const changeChat       = require('../../helpers/chats/change');

const cache            = require('apicache');

module.exports = (token, cid, name) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get user token...
    getToken(token)
    .then((response) => {
      if (response.type == "userAccount") {
        // And now let's check user's permissions. 
        checkPermission(token, cid, "changeName")
        .then((response) => {
          const permission = response;

          if (permission.granted) {
            // And now let's change chat's name...
            changeChat(cid, { name })
            .then((chat) => {
              // By the way, let's now clear our
              // cached chat's information.

              cache.clear(`chatInformation/${cid}`);

              resolve(chat);
            }).catch((error) => {
              reject(error);
            });
          } else {
            reject({ status: 400, error: "InsufficientPermission" });
          };
        }).catch((error) => {
          console.log("ERROR 2");
          console.log(error);
          reject({ status: 400, error: "ServerError" });
        });
      } else {
        reject({ status: 400, error: "InvalidToken" });
      };
    }).catch((error) => {
      console.log("ERROR 1");
      console.log(error);
      reject(error);
    });
  });
};