const config = require('config');
const axios  = require('axios');

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"tokens","token":"${token}"}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        reject("NotFound");
      } else {
        resolve(data);
      }
    })
    .catch(() => {
      reject("ServerError")
    });
  })
};