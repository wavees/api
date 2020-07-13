// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

const helpers = {
  getToken: require('../../../helpers/tokens/get'),
  createToken: require('../../../helpers/tokens/create')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (appId, token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's generate search query.
    let query = {
      $$storage: "applications",
      $$findOne: true,

      _id: appId
    }; 

    // And now let's make GET request to
    // the server.
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let application = response.data;

      // Now let's work with this data.
      if (application.error != "404") {
        // And since we've gotten application data,
        // let's now get user data and proceed to next
        // steps.
        if (application.members.length >= 1) {
          helpers.getToken(token)
          .then((response) => {
            let data = response.data;
            let user = {};

            application.members.forEach((member) => {
              if (member.uid == data.uid) {
                user = member;
                return;
              };
            });

            // Let's check if user with this token
            // can create application token
            // (As for now only owners can create tokens)
            if (user.role == "owner") {
              // So, we found this application and checked for
              // user token. And now we need to create application token.
              let entity = {
                type: "appToken",

                id: appId,
                permissions: "*"
              };

              helpers.createToken(entity)
              .then((response) => {
                let token = response.token;

                resolve({ token });
              }).catch(() => {
                reject({ error: "ServerError" })
              });
            } else {
              reject({ error: "InsufficientPermission", code: 400 });
            };
          }).catch((error) => {
            console.log(error);
            reject({ error: error == "NotFound" ? "InvalidToken" : "ServerError", code: error == "NotFound" ? 404 : null });
          })
        } else {
          reject({ error: "ServerError" });
        }
      } else {
        reject({ error: "NotFound", code: 404 });
      }
    }).catch((error) => {
      reject({ error: "ServerError" });
    });
  });
};