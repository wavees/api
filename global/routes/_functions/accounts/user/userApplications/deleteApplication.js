// @section Import
// Here we'll import all modules and
// components we'll need.

const helpers = {
  getToken: require('../../../../../helpers/tokens/get'),
  deleteToken: require('../../../../../helpers/tokens/delete'),

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
            // And now, by the way, we need to delete
            // all application's tokens
            
            let query = {
              $$storage: "tokens",
              $$multi: true,
              "data.uid": data.uid,
              "data.registrat.id": appId
            };
            helpers.deleteToken(query);
            
            resolve({ deleted: true });
          } else {
            reject({ error: "NothingDeleted" });
          }
        }).catch((error) => {
          console.log('2');
          console.log(error);
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