// @section Import
// Here we'll import all modules and
// components we'll need.

// Helpers
const helpers = {
  getToken: require('../../../../helpers/tokens/get'),
  updateToken: require('../../../../helpers/tokens/update'),

  removeFromArray: require('../../../../helpers/removeFromArray')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (sessionToken, token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // First check-up
    if (sessionToken == null || token == null) reject({ error: "InvalidPayload" });

    // Let's get that session token first.
    helpers.getToken(sessionToken)
    .then((response) => {
      let data = response.data;

      if (data.type == "session") {
        // Ok, so now we need to delete this
        // token from current session
        let session = data;
        
        session.profiles = helpers.removeFromArray(session.profiles, token);

        // Let's update that token and than
        // return it to user
        helpers.updateToken(sessionToken, session)
        .then((response) => {
          resolve(response);
        })
        .catch(() => {
          reject({ error: "ServerError" });
        });
      } else {
        reject({ error: "InvalidToken" });
      };
    })
    .catch(() => {
      reject({ error: "ServerError" });
    })
  });
};