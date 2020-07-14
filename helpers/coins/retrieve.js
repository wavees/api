// Helper function, that'll
// return specific user's
// coins. We need to pass
// UID to this function.

// Let's now import some modules.
const axios  = require('axios');
const config = require('config');

module.exports = (id) => {

  // Let's, by the way, return promise...
  return new Promise((resolve, reject) => {
    // And now let's just form our request
    // and make it..
    let query = {
      $$findOne: true,
      $$storage: "users",

      _id: id
    };

    // And now let's make this request.
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;

      if (data.username != null) {
        let coins = data.coins;

        // Default coins...
        if (typeof coins != "number") {
          coins = 100;
        };

        // And now let's just return our coins
        // back...
        resolve(coins);
      } else {
        reject({ error: "NotFound", code: 404 });
      };
    }).catch(() => {
      reject({ error: "ServerError" });
    });
  });
};