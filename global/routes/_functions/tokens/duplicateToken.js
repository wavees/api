// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

const helpers = {
  permissions: require('../../../helpers/permissions/index'),
  
  getToken: require('../../../helpers/tokens/get'),
  createToken: require('../../../helpers/tokens/create')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token, body) => {

  // Let's return promise...
  return new Promise((resolve, reject) => {
    // Let's firstly get our main token and
    // it's permissions object.
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      let permissions = config.get('permissions.default');
      if (data.permissions == null) {
        permissions = helpers.permissions(...permissions);
      } else {
        permissions = helpers.permissions(...permissions, ...data.permissions);
      };

      // And now let's check if this token
      // have enough permissions to do this.
      if (permissions.has("duplicateToken")) {
        // And now let's try to "duplicate" this token
        // with new settings (permissions, for example)
        let token = response.data;
        permissions = helpers.permissions(...token.permissions, ...body.permissions);

        token.permissions = permissions.list();
        if (token.permissions.includes("duplicateToken")) {
          token.permissions = token.permissions.filter(perm => perm != "duplicateToken");
        };

        // And now let's create new token...
        helpers.createToken(token)
        .then((response) => {
          resolve({ token: response.token });
        }).catch(() => {
          reject({ error: "ServerError" });
        });
      } else {
        reject({ status: 400, error: "" });
      };
    }).catch(() => {
      reject({ status: 400, error: "InvalidToken" });
    })
  });
};