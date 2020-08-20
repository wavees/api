const getToken    = require('../../../helpers/tokens/get');

const config      = require('config');
const Permissions = require('../../../helpers/permissions');

module.exports = (token, permission) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get our token...
    getToken(token)
    .then((response) => {
      const data = response.data;

      // And now let's create our
      // permissions object.
      let permissions = config.get('permissions.default');
      if (data.permissions == null) {
        permissions = Permissions(...permissions);
      } else {
        permissions = Permissions(...permissions, ...data.permissions);
      };

      // Now we need to check if we
      // have this.permission
      if (permissions.has(permission)) {
        resolve({ permission: permission, state: "Permitted" })
      } else {
        reject({ status: 400, permission: permission, state: "InsufficientPermission" });
      };
    }).catch((error) => {
      if (error == "NotFound") {
        reject({ status: 404, error: "NotFound" });
      } else {
        reject({ status: 500, error: "ServerError" });
      };
    });
  });
};