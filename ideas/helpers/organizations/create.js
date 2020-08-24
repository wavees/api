const config          = require('config');
const axios           = require('axios');
const cache           = require('apicache');

const getToken        = require('../tokens/get');
const checkPermission = require('../tokens/permissions/check');
const addMember       = require('./members/add');

module.exports = (token, configuration = {}) => {
  return new Promise((resolve, reject) => {
    // Let's uncache this token's information.
    cache.clear(`org-${token.token}`);
    
    // And now we need to check this
    // token's permission...
    if (configuration.type != "UserOrganization") {
      if (!checkPermission(token, "ideas/createOrganizations")) {
        reject({ status: 400, error: "InsufficientPermission" });
        return;
      };
    };

    // And now let's create this organization
    // and add this user to it.
    let organization = {
      $$storage: "ideas-organizations",

      type: configuration.type,

      name: configuration.name || `${token.data.user.username}'s Org`,
      description: configuration.description || `Normal Organization`,

      // Owner Id
      ownerId: token.data.user.uid
    };

    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, organization)
    .then((response) => {
      const organization = response.data.document;
      // And now let's add this user
      // to this organization.

      addMember(token.data.user.uid, organization._id)
      .then(() => {
        // Let's just return this organization's information.
        resolve(organization);
      }).catch((error) => {
        reject(error);
      });
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};