// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

const helpers = {
  getToken: require('../../../../../helpers/tokens/get')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's get that user token
    // Let's check user token first.
    console.log(token);
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      if (data.type == "user") {
        // So, we found user token and now we need
        // to find list of user's application
        let query = {
          $$storage: "applications",
          $$findOne: false,

          members: { $in: [ { uid: data.uid, role: "owner" } ] }
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
        .then((response) => {
          let data = response.data;

          if (data.error != "404") {
            resolve(data);
          } else {
            resolve([]);
          }
        }).catch((error) => {
          console.log("ERROR 1");
          console.log(error);
          resolve([]);
        });
      } else {
        reject({ code: 400, error: "InvalidToken" });
      };
    }).catch((error) => {
      reject({ code: error == "NotFound" ? 404 : 500, error: "InvalidToken" })
    })
  });
};