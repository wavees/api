const config  = require('config');
const axios   = require('axios');

const getUser = require('../user/get');

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    // Let's prepare our request
    let request = {
      $$storage: "flow-tokens",
      $$findOne: true,

      // Token itself
      token
    };
    
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      const data = response.data;

      if (data.error == "404") {
        reject({ status: 404, error: "NotFound" });
      } else {
        if (data.data.type == "user") {
          // And now let's check our user
          // provider...
          if (data.provider == "wavees") {

          } else {
            // Okay, so now we just need to get
            // some information about this user!
            getUser(data.data.uid)
            .then((response) => {
              resolve(response);
            }).catch(() => {
              reject({ status: 404, error: "NotFound" });
            });
          };
        };
      };
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};