// Importing modules
const axios  = require('axios');
const config = require('config');

// And now let's just export our main
// function
module.exports = (uid) => {
  return new Promise((resolve, reject) => {
    let request = {
      $$storage: "blog-aliases",
      $$findOne: true,

      uid: uid
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        reject({ status: 404, error: "NotAliasFound" });
      } else {
        resolve(data);
      };
    }).catch(() => {
      reject({ error: "ServerError" });
    });
  });
};