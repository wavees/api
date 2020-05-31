// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

const helpers = {
  permissions: require('../../../../helpers/permissions/index'),
  getToken: require('../../../../helpers/tokens/get')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      if (data.type == "user") {
        // Let's read this token's permissions
        let permissions
        if (data.permissions == null) {
          permissions = helpers.permissions(config.get('permissions.default'));
        } else {
          permissions = helpers.permissions(data.permissions);
        }

        // Now we need to get this user
        // object and return it. 
        let query = {
          $$storage: "users",
          $$findOne: true,

          _id: data.uid
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
        .then((response) => {
          let data = response.data;

          if (data.error != "404") {
            // Now we need to filter this response
            // according to token's permissions.
            let profile = {};

            // @permission: readEmail
            profile.email    = permissions.has("readEmail") ? data.email : null;

            // @permission: readAvatar
            profile.avatar   = permissions.has("readAvatar") ? `${config.get('api.avatars')}/${data.avatar}` : null;

            // @permission: readUsername
            profile.username = permissions.has("readUsername") ? data.username : null;

            // @uid
            profile.uid = data._id;

            resolve(profile);
          } else {
            reject({ error: "InvalidToken" });
          }
        }).catch((error) => {
          console.log(error);
          reject({ error: "ServerError" });
        });
      }
    }).catch(() => {
      reject({ error: "InvalidToken" });
    });
  });
};