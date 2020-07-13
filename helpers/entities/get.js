const config = require('config');
const axios  = require('axios');

module.exports = (query) => {
  return new Promise((resolve, reject) => {
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;
      console.log("DATA 1:");
      console.lod(data);

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