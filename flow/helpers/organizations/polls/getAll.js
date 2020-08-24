const axios  = require('axios');
const config = require('config');

module.exports = (oid) => {
  return new Promise((resolve, reject) => {
    // Let's prepare our query.
    let query = {
      $$storage: "ideas-polls",
      oid
    };

    // And now let's just get this Organization's Polls
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let polls = [];

      // By the way, we need to check
      // if all this polls is in correct
      // data format.
      resolve(response.data);
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};