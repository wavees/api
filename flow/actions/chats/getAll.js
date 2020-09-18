const getAllChats = require('../../helpers/chats/getAll');
const getChat     = require('../../helpers/chats/get');
const getToken    = require('../../helpers/tokens/get');

const getSettings = require('../../helpers/chats/settings/user');

module.exports = (token) => {
  return new Promise((resolve, reject) => {

    // Let's firstly get our user token.
    getToken(token)
    .then((response) => {
      const token = response;

      if (token.type == "userAccount") {
        // Let's now get all user chat's
        getAllChats(token.uid)
        .then((response) => {
          const memberships    = response;
          let membersLength    = memberships.length;
          
          let chats       = [];

          // And now let's loop all this chats
          // and get information about them...
          if (membersLength > 0) {
            memberships.forEach((membership) => {
              getChat(membership.cid)
              .then((response) => {
                const chat = response;

                // And now let's get user-specific
                // chat settings.
                getSettings(0, 0)
                .then((settings) => {
                  chat.settings.user = settings

                  chats.push(chat);

                  if (chats.length >= membersLength) {
                    resolve(chats.sort((a,b) => (a.settings.user.position > b.settings.user.position) ? 1 : ((b.settings.user.position > a.settings.user.position) ? -1 : 0)));
                  };
                }).catch((error) => {
                  membersLength -= 1;
                });
              }).catch(() => {
                membersLength -= 1;
              });
            });
          } else {
            resolve([]);
          };
        }).catch((error) => {
          console.log(error);
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