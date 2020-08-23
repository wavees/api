const config = require('config');
const axios  = require('axios');
const getAlias = require('./getAlias');

module.exports = (appId, query) => {
  return new Promise((resolve, reject) => {
    // Let's firstly try to parse our query object.
    try {
      const parsedQuery = JSON.parse(query);
      
      // And now let's try to find this alias.
      let request = {
        $$storage: `aliases-${appId}`,
        $$findOne: true,

        ...parsedQuery
      };

      axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
      .then((response) => {
        let data = response.data;

        if (data.error == "404" && data.alias == null) {
          reject({ status: 404, error: "NotFound" });
        } else {
          getAlias(data.alias, appId)
          .then((response) => {
            resolve(response);
          }).catch((error) => {
            reject(error);
          });
        };
      }).catch(() => {
        reject({ status: 500, error: "ServerError" })
      });
    } catch (error) {
      reject({ status: 400, error: "InvalidQuery" });
    };
  });
};