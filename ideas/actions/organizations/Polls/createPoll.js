const getToken        = require('../../../helpers/tokens/get');
const getOrganization = require('../../../helpers/organizations/get');

const createPoll      = require('../../../helpers/organizations/polls/create');

module.exports   = (token, oid, body) => {
  return new Promise((resolve, reject) => {
    // Let's firstly check our token.
    getToken(token)
    .then((response) => {
      const token = response;

      if (token.type == "user") {
        // And now let's get some information about this organization.
        getOrganization(oid)
        .then((response) => {
          const organization = response;

          // And now let's check if user have
          // enough permissions to create
          // new polls
          
          // NEED REWRITE
          if (organization.ownerId == token.data.user.uid) {
            // Now let's just create new Poll and let's then
            // return it...
            createPoll(organization.id, body)
            .then((response) => {
              resolve(response);
            }).catch((error) => {
              reject(error);
            });
          } else {
            reject({ status: 400, error: "InsufficientPermission" });
          };
        }).catch((error) => {
          reject(error);
        });
      } else {
        reject({ status: 400, error: "InvalidToken" });
      };
    }).catch((error) => {
      reject(error);
    });
  });
};