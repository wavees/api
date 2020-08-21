const axios  = require('axios');
const config = require('config');

module.exports = (id) => {
  return new Promise((resolve, reject) => {
    // Let's now check if it's an Alias
    // or no
    axios.get(`${config.get('apiAlias.url')}/${config.get('apiAlias.version')}/${config.get('application.id')}/alias/${id}`)
    .then((response) => {
      let data = response.data;

      if (data.data.uid != null) {
        resolve({ dataType: "checkData", type: "user" });
      } else {
        proceed(id);
      };
    }).catch(() => {
      proceed(id);
    });

    function proceed(id) {
      // Let's check if it's an user or no.
      axios.get(`${config.get('api.url')}/${config.get('api.version')}/user/${id}`)
      .then((response) => {
        resolve({ dataType: "checkData", type: "user" });
      }).catch(() => {
        // And now we need to check if it's a blog post or
        // no.
        resolve({ dataType: "checkData", type: "undefined" });
      });
    };
  });
};