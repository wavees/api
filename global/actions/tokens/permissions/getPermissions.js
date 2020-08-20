const getToken    = require('../../../helpers/tokens/get');
const config      = require('config');

const Permissions = require('../../../helpers/permissions');

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get our token
    getToken(token)
    .then((response) => {
      const data = response.data;
      
      // And now let's just return permissions object
      // (with default permisisons)
      let permissions = config.get('permissions.default');
      if (data.permissions == null) {
        permissions = Permissions(...permissions);
      } else {
        permissions = Permissions(...permissions, ...data.permissions);
      };

      resolve(permissions.list());
    }).catch((error) => {
      if (error == "NotFound") {
        reject({ status: 404, error: "NotFound" });
      } else {
        reject({ status: 500, error: "ServerError" });
      };
    });
  });
};