const axios       = require('axios');
const config      = require('config');

const getToken    = require('../../../helpers/tokens/get');
const addMember   = require('../../../helpers/chats/members/add');

const getChat     = require('../../../helpers/chats/get');
const sendMessage = require('../../../helpers/chats/messages/create');

const events      = require('../../../events');

module.exports = (token, words) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get token information
    getToken(token)
    .then((response) => {
      const token = response;

      if (token.type == "userAccount") {
        // And now we need to find this invitation..
        let request = {
          $$storage: "flow-invitations",
          $$findOne: true,

          // Our Invite words
          words
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
        .then((response) => {
          const data = response.data;

          if (data.error == "404") {
            reject({ status: 404, error: "NotFound" });
          } else {

            // Let's check if this user is already
            // a member of this chat.
            getChat(data.cid)
            .then((response) => {
              const chat = response;

              if (chat.members.includes(token.uid)) {
                reject({ status: 400, error: "UserAlreadyAChatMember" });
              } else {
                // By the way, let's send join
                // message to this chat.
                if (chat.settings.joinMessage == null ? true : chat.settings.joinMessage) {
                  events.emit('chat/sentMessage', data.cid, { author: { type: "systemJoinMessage", uid: token.uid }, message: { type: "joinMessage" } }, "storedMessage");
                  sendMessage(data.cid, { type: "systemJoinMessage", uid: token.uid }, { type: "joinMessage" });  
                };

                // And now let's add this user to
                // this chat...
                addMember(data.cid, token.uid)
                .then((response) => {
                  resolve(response);
                }).catch((error) => {
                  reject(error);
                });
              };
            }).catch((error) => {
              reject(error);
            });
          };
        }).catch(() => {
          reject({ status: 500, error: "ServerError" });
        });
      } else {
        reject({ status: 400, error: "InvalidToken" });
      };
    }).catch(() => {
      reject({ status: 400, error: "InvalidToken" });
    });
  });
};