const axios  = require('axios');
const config = require('config');
const moment = require('moment');

module.exports = (cid) => {
  return new Promise((resolve, reject) => {
    // Let's firstly make one request to
    // get our invitation words.
    axios.get(`https://random-word-api.herokuapp.com/word?number=6&swear=0`)
    .then((response) => {
      let data = response.data;

      // And now let's create our invitation object.
      const invite = {
        $$storage: "flow-invitations",

        // Chat Id
        cid,

        maximumUses: -1,

        // Other Information
        words: data.join(' '),
        creationDate: moment().unix()
      };

      // And now let's post this invite's information to
      // our database.
      axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, invite)
      .then((response) => {
        resolve({
          id: response.data.document._id,

          cid,

          words: response.data.document.words,
          creationDate: response.data.document.creationDate
        });
      }).catch(() => {
        reject({ status: 500, error: "ServerError" });
      });
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};