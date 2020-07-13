// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

// Helpers
const helpers = {
  getToken: require('../../../../helpers/tokens/get'),

  getUser: require('../user/getUser')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      // Let's check if this is a session
      // or an user
      if (data.type == "session") {
        // It's a session
        let profiles = data.profiles;

        if (profiles.length > 0) {
          resolve({ type: "session", current: data.current, profiles: profiles });
        } else {
          reject({ error: "NotFound" });
        }
      } else if (data.type == "user") {
        // It's an user

        helpers.getUser(token)
        .then((response) => {
          resolve(response);
        }).catch((error) => {
          reject(error);
        });
      } else {
        reject({ error: "InvalidToken" });
      }
    })
    .catch(() => {
      reject({ error: "InvalidToken" });
    });
  });
};