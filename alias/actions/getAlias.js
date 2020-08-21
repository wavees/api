const getToken = require('../helpers/tokens/get');
const config   = require('config');
const axios    = require('axios');

module.exports = (alias, appId) => {
  return new Promise((resolve, reject) => {

    // Prepare request...
    let request = {
      $$storage: `aliases-${appId}`,
      $$findOne: true,

      alias
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        resolve({ status: 404, error: "NotFound" });
      } else {
        data._id = undefined;

        // Let's now get some information about this
        // application.
        axios.get(`${config.get('api.url')}/v1/application/${appId}`)
        .then((response) => {

          data.application = response.data;
          resolve(data);
        }).catch(() => {
          data.application = {
            id: appId,

            status: "error",
            errorCode: "500",
            error: "ServerError"
          };
          resolve(data);
        });
      };
    }).catch((error) => {
      reject(error.response.body || { status: 500, error: "ServerError" });
    });
  })
};