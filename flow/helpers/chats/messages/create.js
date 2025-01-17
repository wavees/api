const axios  = require('axios');
const config = require('config');

const moment = require('moment');

const cache  = require('apicache');

module.exports = (cid, author, message) => {
  return new Promise((resolve, reject) => {
    // Let's just create this message
    let query = {
      $$storage: `flow-messages-${cid}`,

      // Channel Id;
      cid,

      // Author
      author,

      // Message itself
      message,

      sent: moment().unix()
    };

    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, query)
    .then((response) => {
      // Now let's clear our chat messages cached
      // information.
      cache.clear(`chatMessages/${cid}`);

      resolve(response.data.document);
    }).catch(() => {
      reject({ status: 500, error: "ServerError" })
    });
  });
};