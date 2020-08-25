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
          resolve([{
            id: response._id,
            cid: response.cid,

            words: response.words,

            creationDate: invitation.creationDate
          }]);
        }).catch(() => {
          reject({ status: 500, error: "ServerError" });
        });
      } else {
        let invitations = []

        // let's prepare our invitations array
        data.forEach((invitation) => {
          invitations.push({
            id: invitation._id,
            cid: invitation.cid,

            words: invitation.words,

            creationDate: invitation.creationData,
          });
        });

        resolve(invitations);
      };
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};