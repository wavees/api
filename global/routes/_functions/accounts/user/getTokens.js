// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

const helpers = {
  permissions: require('../../../../helpers/permissions/index'),
  getToken: require('../../../../helpers/tokens/get')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // now we need to get that uid
    helpers.getToken(token)
    .then((response) => {
      let user = response.data;

      if (user.type == "user") {
        // And now we need to check permissions of this token...
        let permissions = config.get('permissions.default');
        if (user.permissions == null) {
          permissions = helpers.permissions(...permissions);
        } else {
          permissions = helpers.permissions(...permissions, ...user.permissions);
        };

        // Now we'll check if this token has needed permission.
        if (permissions.has("getTokens")) {
          // And now we'll get all user tokens and then return them back.
          let query = {
            $$storage: "tokens",
            "data.uid": user.uid
          };

          axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
          .then((response) => {
            let data = response.data;

            if (data.error == "404") {
              resolve([]);
            } else {
              resolve(data);
            };
          }).catch((error) => {
            reject({ error: "ServerErorr" });
          });
        } else {
          reject({ error: "InsufficientPermission", code: 400 });
        };
      } else {
        reject({ error: "InvalidToken", code: 400 });
      };
    }).catch((error) => {
      reject(error);
    });
  });
};