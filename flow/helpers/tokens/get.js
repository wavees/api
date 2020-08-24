const config  = require('config');
const axios   = require('axios');

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    axios.get(`${config.get('api.url')}/v2/token/${token}`)
    .then((response) => {
      resolve(response.data);
    }).catch((error) => {
      reject(error.response.data);
    });
  });
};