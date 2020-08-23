const axios    = require('axios');
const config   = require('config');

const getToken = require('../tokens/get')

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    getToken(token)
    .then((response) => {
      // And now let's just get ids of all user's
      // organizations.
      let query = {
        $$storage: "ideas-membership",
        type: "membership",

        uid: response.data.user.uid
      };

      axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
      .then((response) => {
        let data = response.data || [];

        if (data.length <= 0) {
          resolve([]);
        } else {
          let organizationsIds = [];

          data.forEach((membership) => {
            organizationsIds.push(membership.oid);
          });

          resolve(organizationsIds);
        };
      }).catch(() => {
        reject({ status: 500, error: "ServerError" });
      });
    }).catch(() => {
      reject({ status: 400, error: "InvalidToken" });
    });
  });
};