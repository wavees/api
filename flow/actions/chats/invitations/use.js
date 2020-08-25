const axios     = require('axios');
const config    = require('config');

const getToken  = require('../../../helpers/tokens/get');
const addMember = require('../../../helpers/chats/members/add');

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
            // And now let's add this user to
            // this chat...
            addMember(data.cid, token.uid)
            .then((response) => {
              resolve(response);
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