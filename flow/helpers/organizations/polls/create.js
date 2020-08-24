const axios  = require('axios');
const config = require('config');
const cache  = require('apicache');

module.exports = (oid, body) => {
  return new Promise((resolve, reject) => {
    // Let's firstly prepare our request
    let request = {
      $$storage: "ideas-polls",

      // Settings
      settings: {
        comminutyDriven: body.settings.comminutyDriven || true,
        public: body.settings.public || false
      },

      // Visual
      name: body.name,
      description: body.description,
    
      // Organization Id
      oid
    };

    // And now let's make this request and,
    // by the way, let's uncache something
    // very special.
    cache.clear(`polls-${oid}`);

    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, request)
    .then((response) => {
      resolve(response.data.document);
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};