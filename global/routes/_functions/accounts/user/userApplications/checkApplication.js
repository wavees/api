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
module.exports = (token, appId) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's get that user object
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      // Let's check if it's an user token.
      if (data.type == "user") {
        // Now we need to prepare one query request
        // and then make it. (???)
        let query = {
          $$findOne: true,

          type: "approvedApplication",
          appId: appId
        };

        // And now we need to get that store
        helpers.getStore(token, query)
        .then((response) => {
          let data = response;
          console.log(data);

          // Let's check something
          if (data.error == "404") {
            resolve({});
          } else {
            // And now let's return a response.
            let response = {
              agreed: true,
              registrat: data.registrat
            };

            resolve(response);
          }
        }).catch(() => {
          reject({ error: "ServerError"  });
        });
      } else {
        reject({ error: "InvalidToken" });
      }
    }).catch((erorr) => {
      reject({ error: "InvalidToken" });
    });
  });
};