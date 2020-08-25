const config     = require('config');
const axios      = require('axios');

const randomizer = require('../randomizer');

module.exports = (data) => {
  return new Promise((resolve, reject) => {
    // Let's now prepare our token information.
    let token = {
      $$storage: "flow-tokens",

      // Token itself
      token: randomizer(10),

      // Data
      data
    };

    // And now let's just create this token
    // and then let's return it's information.
    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, token)
    .then((response) => {
      const data = response.data.document;
      const token = {
        token: data.token,

        data: data.data
      };

      resolve(token);
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};