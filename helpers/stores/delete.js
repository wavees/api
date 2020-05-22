const axios   = require('axios');
const config  = require('config');

const helpers = {
  getToken: require('../tokens/get.js')
};

module.exports = (token, searchQuery) => {
  return new Promise((resolve, reject) => {
    helpers.getToken(token)
    .then((response) => {
      // Let's check if this is user token
      // or not.

      if (response.data.type == "user") {
        // It's an user token, so let's
        // get needed data;
        let query = searchQuery;

        query.$$storage = "stores";
        query._uid = response.data.uid;

        axios.delete(`${config.get('nodes.main.url')}/delete/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
        .then((response) => {
          if (response.error != "404") {
            // Let's reply user with data he needed.
            let data = response.data;

            // Let's delete this
            resolve(data);
          } else {
            reject("NotFound");
          }
        }).catch((error) => {
          console.log(error);
          reject("ServerError");
        });
      } else {
        reject("InvalidToken");
      }
    }).catch((error) => {
      reject(error == "NotFound" ? "InvalidToken" : error);
    })
  });
};