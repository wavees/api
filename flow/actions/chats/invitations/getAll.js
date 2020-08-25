const getToken   = require('../../../helpers/tokens/get');
const getChat    = require('../../../helpers/chats/get');
const getInvites = require('../../../helpers/invitations/get');

module.exports = (token, cid) => {
  return new Promise((resolve, reject) => {
    // Firstly we need to get this token's information.
    getToken(token)
    .then((response) => {
      const token = response;
    
      if (token.type == "userAccount") {
        // And now let's get this chat.
        getChat(cid)
        .then((response) => {
          const chat = response;

          // Now let's check if this user can
          // see this chat's invitation links
          if (chat.members.includes(token.uid)) {
            // And now let's get our invitation links.
            getInvites(cid)
            .then((response) => {
              resolve(response.sort());
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
    }).catch((error) => {
      reject(error);
    });
  });
};