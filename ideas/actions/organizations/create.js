const create = require('../../helpers/organizations/create');
const createOrganization = require('../../helpers/organizations/create');

module.exports = (token, configuration) => {
  return new Promise((resolve, reject) => {
    createOrganization(token, configuration)
    .then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  });
};