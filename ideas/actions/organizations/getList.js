const getAll             = require('../../helpers/organizations/getAll');
const getToken           = require('../../helpers/tokens/get');
const createOrganization = require('../../helpers/organizations/create');
const getOrganization = require('../../helpers/organizations/get');

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    getToken(token)
    .then((response) => {
      const token = response;

      // Let's check if it's an user token.
      if (token.type != "user") {
        reject({ status: 400, error: "InvalidToken" });
      } else {
        // Let's just get all orgnizations.
        getAll(token.data.user.uid)
        .then((response) => {
          let organizationsIds = response;
          let organizationsLength = organizationsIds.length;
          let organizations = [];

          // Let's now "prepare" all our organization
          // information...
          if (organizationsIds.length <= 0) {
            // And now we need to create UserOrganization
            createOrganization(token.token, {
              type: "UserOrganization"
            })
            .then((response) => {
              resolve([response]);
            }).catch((error) => {
              reject(error);
            });
          } else {
            organizationsIds.forEach((oid) => {
              getOrganization(oid)
              .then((response) => {
                organizations.push(response);

                if (organizations.length >= organizationsLength) {
                  // And now we need to check if we have
                  // our USER organization
                  if (!organizations.find((org) => org.type == "UserOrganization" && org.ownerId == token.data.user.uid )) {

                    // And now we need to create UserOrganization
                    createOrganization(token.token, {
                      type: "UserOrganization"
                    })
                    .then((response) => {
                      organizations.push(response);

                      resolve(organizations);
                    }).catch((error) => {
                      reject(error);
                    });
                  } else {
                    resolve(organizations);
                  };
                };
              }).catch(() => {
                organizationsLength -= 1;
              });
            });
          };
        }).catch((error) => {
          reject(error);
        });
      };
    }).catch((error) => {
      reject(error);
    });
  });
};