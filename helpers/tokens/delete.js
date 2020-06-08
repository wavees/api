const config = require('config');
const axios  = require('axios');

module.exports = (query) => {
  return new Promise((resolve, reject) => {
    axios.delete(`${config.get('nodes.main.url')}/delete/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      console.log("ERROR:");
      console.log(error.data);
      reject("ServerError");
    });
  });
};