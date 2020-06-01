// @section Import
// Here we'll import all modules and
// components we'll need.

const axios    = require('axios');
const config   = require('config');

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (appId) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's get an application with this id...
    let query = {
      $$storage: "applications",
      $$findOne: true,

      _id: appId
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;

      if (data.error != "404") {
        // Let's prepare application's object...
        let application = {};

        // Application id
        application.id       = data._id;

        // Application branding
          // +Name
        application.name     = data.name;

          // +Logotype
        application.logotype = `${config.get('api.avatars')}/${data.logotype}`;

        resolve(application);
      } else {
        reject({ error: "NotFound", code: 404 });
      }
    }).catch(() => {
      reject({ error: "ServerError" });
    });
  });
}; 