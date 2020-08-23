// Importing modules
const axios  = require('axios');
const config = require('config');

// And now let's just export our main
// function
module.exports = (uid) => {
  return new Promise((resolve, reject) => {
    axios.get(`${config.get('apiAlias.url')}/${config.get('apiAlias.version')}/${config.get('application.id')}/{"data.uid":"${uid}"}`)
    .then((response) => {
      let data = response.data;

      resolve(data);
    }).catch((error) => {
      console.log(error);
      reject(error.response);
    });
  });
};