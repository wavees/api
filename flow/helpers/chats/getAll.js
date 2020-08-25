const axios    = require('axios');
const config   = require('config');

const getToken = require('../tokens/get.js');

console.log(getToken);

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get our token
    // and check its information.
    getToken(token)
    .then((response) => {
      const token = response;

      if (token.type == "userAccount") {
        // And now let's just get all
        // user chats.

        let request = {
          $$storage: "flow-chatMembership",

          uid: token.uid
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
        .then((response) => {
          resolve(response.data || []);
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