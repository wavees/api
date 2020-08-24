const getToken        = require('../../../helpers/tokens/get');
const getOrganization = require('../../../helpers/organizations/get');
const getPolls        = require('../../../helpers/organizations/polls/getAll')

module.exports = (token, oid) => {
  return new Promise((resolve, reject) => {
    // Let's firstly check our token.
    getToken(token)
    .then((response) => {
      const token = response;

      // And now let's check this token's
      // information.
      if (token.type == "user") {
        // Here we'll check if this user
        // is in this organization.
        getOrganization(oid)
        .then((response) => {
          const organization = response;

          // Now let's check if user have enough
          // permission to view ALL polls.

          // NEED REWRITE
          if (organization.ownerId == token.data.user.uid) {
            // And now let's just get this Organization's Polls
            // and return them.
            getPolls(organization.id)
            .then((response) => {
              resolve(response);
            }).catch((error) => {
              reject(error);
            });
          } else {
            reject({ status: 400, error: "InsufficientPermissions" });
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