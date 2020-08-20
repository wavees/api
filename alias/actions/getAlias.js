const getToken = require('../helpers/tokens/get');
const config   = require('config');
const axios    = require('axios');

module.exports = (alias, token) => {
  return new Promise((resolve, reject) => {
    
    // Let's firstly get some information about
    // our token...
    getToken(token)
    .then((response) => {
      if (response.type == "appToken") {
        const application = response.data.application;

        // Prepare request...
        let request = {
          $$storage: `aliases-${application.id}`,
          $$findOne: true,

          alias
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
        .then((response) => {
          resolve(response.data);
        }).catch((error) => {
          reject(error.response.body || { status: 500, error: "ServerError" });
        });
      } else {
        reject({ status: 400, error: "InvalidToken" });
      };
    }).catch((error) => {
      reject(error.status == 500 ? { status: 400, error: "Unauthorized" } : error);
    });
  })
};