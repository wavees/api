const axios   = require("axios");
const config  = require("config");

const helpers = {
  getToken: require('../tokens/get.js')
};

module.exports = (token, data) => {
  return new Promise((resolve, reject) => {
    helpers.getToken(token)
    .then((response) => {
      if (response.data.type == "user") {
        // It's an user token, so let's continue...
        let uid = response.data.uid;
        
        let post = data;
        post.$$storage = "stores";
        post._uid = uid;

        // Let's create this store
        axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, post)
        .then((response) => {
          resolve(response.data.document);
        })
        .catch((error) => {
          reject("ServerError");
        })
      } else {
        reject("InvalidToken");
      }
    }).catch((error) => {
      reject(error == "NotFound" ? "InvalidToken" : error);
    });
  })
};