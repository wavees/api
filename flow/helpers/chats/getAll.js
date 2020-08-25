const axios    = require('axios');
const config   = require('config');

module.exports = (uid) => {
  return new Promise((resolve, reject) => {
    // And now let's just get all
    // user chats.

    let request = {
      $$storage: "flow-chatMembership",

      // User Id
      uid
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      resolve(response.data || []);
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};