const axios  = require('axios');
const config = require('config');

module.exports = (cid, limit = 50) => {
  return new Promise((resolve, reject) => {
    let query = {
      $$storage: `flow-messages-${cid}`,
      $$limit: limit,
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        resolve([]);
      } else {
        resolve(data);
      };
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};