// @section Import
// Here we'll import all modules and
// components we'll need.

const helpers = {
  getToken: require('../../../../../helpers/tokens/get'),

  getStore: require('../../../../../helpers/stores/get')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's get user object
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      // Check if it's an user object
      if (data.type == "user") {
        // Now we need to prepare one query
        // and then get list of approved applications
        let query = {
          type: "approvedApplication"
        };

        helpers.getStore(token, query)
        .then((response) => {
          let applications = [];
          
          response.forEach((app) => {
            if (app.appId != null) {
              // Let's prepare this app object
              let filtered = {};

              // User Id
              filtered.uid   = app._uid;
              
              // Approval time
              filtered.time  = app.time

              // Application id
              filtered.appId = app.appId;

              applications.push(filtered);
            }
          });

          resolve(applications);
        }).catch((error) => {
          reject({ error: error == "InvalidToken" ? "InvalidToken" : "ServerError" });
        });

      } else {
        reject({ error: "InvalidToken" });
      }
    }).catch(() => {
      reject({ error: "InvalidToken" });
    });
  });
}