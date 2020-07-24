// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

const helpers = {
  getUser: require('./getUser'),

  permissions: require('../../../../helpers/permissions/index'),
  getToken: require('../../../../helpers/tokens/get')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token, username) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's get that user token
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;
      
      // And now we need to check if it's an user
      // token
      if (data.type == "user") {
        // And now we need to check this token's permissions
        // and check something.
        let permissions = config.get('permissions.default');
        if (data.permissions == null) {
          permissions = helpers.permissions(permissions);
        } else {
          permissions = helpers.permissions(permissions.push(user.permissions));
        };

        if (permissions.has("changeUsername")) {
          // Now let's change that username!
          let query = {
            $$storage: "users",
            $$findOne: true,
            _id: data.uid,
          };

          // Firstly we need to get this user's data
          axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
          .then((response) => {
            let user = response.data;

            if (user.error != "404") {
              user.username = username;

              // And now we need to update this document
              axios.put(`${config.get('nodes.main.url')}/update/${config.get('nodes.main.key')}/${JSON.stringify(query)}`, user)
              .then(() => {
                helpers.getUser(token)
                .then((response) => {
                  resolve(response);
                }).catch((error) => {
                  reject(error);
                });
              }).catch(() => {
                reject({ error: "ServerError" });
              })
            } else {
              reject({ error: "UserNotFound", code: 404 });
            };
          }).catch(() => {
            reject({ error: "ServerError" });
          });
        } else {
          reject({ error: "InsufficientPermission", code: 400 })
        }
      } else {
        reject({ error: "InvalidToken", code: 400 });
      }
    }).catch((error) => {
      reject(error);
    })
  });
};