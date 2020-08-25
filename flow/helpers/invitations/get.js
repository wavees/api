const axios            = require('axios');
const config           = require('config');

const createInvitation = require('./create');

module.exports = (cid) => {
  return new Promise((resolve, reject) => {
    // Let's now get all invitations for this
    // chat.
    let request = {
      $$storage: "flow-invitations",

      // Chat Id
      cid
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      let data = response.data;

      if (data.length <= 0) {
        // And now we need to create
        // default invitation.
        createInvitation(cid)
        .then((response) => {
          resolve([response]);
        }).catch(() => {
          reject({ status: 500, error: "ServerError" });
        });
      } else {
        resolve(data);
      };
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};