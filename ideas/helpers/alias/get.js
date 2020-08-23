const axios  = require('axios');
const config = require('config');

module.exports = (uid) => {
  return new Promise((resolve, reject) => {
    // Let's just try to find this alias.
    let query = {
      uid
    };

    axios.get(`${config.get('apiAlias.url')}/${config.get('apiAlias.version')}/${config.get('application.id')}/find/${JSON.stringify(query)}`)
    .then((response) => {
      resolve(response.data);
    }).catch((error) => {
      console.log(error);
      reject({ status: 404, error: "NotFound" });
    });
  });
};