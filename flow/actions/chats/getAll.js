const getAllChats = require('../../helpers/chats/getAll');
const getChat     = require('../../helpers/chats/get');

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    // Let's now get all user chat's
    getAllChats(token)
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
            chats.push(response);

            if (chats.length >= membersLength) {
              resolve(chats);
            };
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
  });
};