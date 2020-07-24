const config = require('config');
const axios  = require('axios');

const randomizer = require('../randomizer');

module.exports = (data) => {
  return new Promise((resolve, reject) => {
    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`,
    {
      $$storage: "tokens",

      token: randomizer(12),
      data: data
    })
    .then((response) => {
      resolve(response.data.document);
    })
    .catch((error) => {
      console.log("ERROR:");
      console.log(error.data);
      reject("ServerError");
    });
  });
};