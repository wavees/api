const getToken           = require('../../helpers/tokens/get');
const checkPermission    = require('../../helpers/tokens/permissions/check');
const createOrganization = require('../../helpers/organizations/create');

module.exports = (token, configuration) => {
  return new Promise((resolve, reject) => {
    // Let's firstly check user's token.
    getToken(token)
    .then((response) => {
      const token = response;

      if (token.type == "user") {
        // And now let's check token's permissions.
        if (checkPermission(token, "ideas/createOrganization")) {
          
          // Here we'll just create new organization.
          createOrganization(token, configuration)
          .then((response) => {
            resolve(response);
          }).catch((error) => {
            reject(error);
          });
        } else {
          reject({ status: 400, error: "InsufficientPermissions" });
        };
      } else {
        reject({ status: 400, error: "InvalidToken" });
      };
    }).catch((error) => {
      reject(error);
    });
  });
};