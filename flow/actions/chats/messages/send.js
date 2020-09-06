const createMessage   = require('../../../helpers/chats/messages/create');
const getToken        = require('../../../helpers/tokens/get');

const checkPermission = require('../../../helpers/chats/permissions/check');
const getChat         = require('../../../helpers/chats/get');

const events          = require('../../../events');

module.exports = (token, cid, message) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get this user's token...
    getToken(token)
    .then((response) => {
      // Let's firstly check this token type.
      if (response.type == "userAccount") {
        // And now let's check if this user can 
        const user = response;

        // Let's firstly check if this player
        // is a member of this chat.

        getChat(cid)
        .then((response) => {
          const chat = response;

          if (!chat.members.includes(user.uid)) {
            reject({ status: 400, error: "InsufficientPermission" });
          } else {
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
    
                // Let's now emit chat/sentMessage event
                events.emit('chat/sentMessage', cid, { author, message: msg }, "storedMessage");
    
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