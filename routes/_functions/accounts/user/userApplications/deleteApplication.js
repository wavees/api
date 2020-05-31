// @section Import
// Here we'll import all modules and
// components we'll need.

const helpers = {
  getToken: require('../../../../../helpers/tokens/get'),

  getStore: require('../../../../../helpers/stores/get'),
  deleteStore: require('../../../../../helpers/stores/delete')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token, appId) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's get user object.
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      if (data.type == "user") {
        // And now let's delete this approved application
        // from user's stores
        let query = {
          appId: appId
        };

        helpers.deleteStore(token, query)
        .then((response) => {
          if (response.deletedCount > 0) {
            resolve({ deleted: true });
          } else {
            reject({ error: "NothingDeleted" });
          }
        }).catch(() => {
          reject({ error: "ServerError" });
        });
      } else {
        reject({ error: "InvalidToken" });
      }
    }).catch((error) => {
      console.log('1');
      console.log(error);
      reject({ error: "InvalidToken" });
    });
  });
};