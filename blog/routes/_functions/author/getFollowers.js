// Importing modules
const axios  = require('axios');
const config = require('config');

// And now let's just export our main
// function
module.exports = (aid) => {
  return new Promise((resolve, reject) => {
    let request = {
      $$storage: "blog-follows",

      aid: aid
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        resolve({ count: 0, list: [] });
      } else {
        resolve({ count: data.length, list: data });
      };
    }).catch(() => {
      resolve({ count: 0, list: [] });
    });
  });
};