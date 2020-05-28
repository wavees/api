// @section Import
// Here we'll import all modules and
// components we'll need.

// Helpers
const helpers = {
  getToken: require('../../../../helpers/tokens/get'),
  updateToken: require('../../../../helpers/tokens/update')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (sessionToken, token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // First check-up
    if (sessionToken == null || token == null) reject({ error: "InvalidPayload" });

    // Let's get this session token...
    helpers.getToken(sessionToken)
    .then((response) => {
      let data = response.data;

      // Let's check if this token is a session
      // token or not
      if (data.type == "session") {
        let session = data;

        // Now, when we have this session token,
        // we need to check-up user token, that
        // we need to add to this session.
        helpers.getToken(token)
        .then((response) => {
          let data = response.data;
          
          if (data.type == "user") {
            // So now we need to add this token to
            // current session.
            let profiles = session.profiles;

            // Let's check if we already have this user
            // in session.
            if (!profiles.includes(token)) {
              session.profiles.push(token);

              helpers.updateToken(sessionToken, session)
              .then((response) => {
                resolve(response);
              })
              .catch(() => {
                reject({ error: "ServerError" });
              });
            } else {
              resolve(session);
            };
          } else {
            reject({ error: "InvalidPayload" });
          }
        })
        .catch(() => {
          reject({ error: "ServerError" });
        })
      } else {
        reject({ error: "InvalidSession" });
      }
    })
    .catch(() => {
      reject({ error: "InvalidSession" });
    });
  });
};