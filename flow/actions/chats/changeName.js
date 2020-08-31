const getToken         = require('../../helpers/tokens/get');
const checkPermissiosn = require('./permissions/check');
const changeChat       = require('../../helpers/chats/change');

module.exports = (token, cid, name) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get user token...
    getToken(token)
    .then((response) => {
      if (response.type == "userAccount") {
        // And now let's check user's permissions. 
        checkPermissiosn(token, cid, "changeName")
        .then((response) => {
          const permission = response;

          if (permission.granted) {
            // And now let's change chat's name...
            changeChat(cid, { name })
            .then((chat) => {
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