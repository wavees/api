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
module.exports = (identifier, type = "token") => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    let permissions = config.get('permissions.default');
    let uid = identifier;

    // @type token
    if (type == "token") {
      helpers.getToken(identifier)
      .then((response) => {
        let data = response.data;

        if (data.type == "user") {
          // Let's read this token's permissions
          if (data.permissions != null) {
            permissions.push(data.permissions);
          };

          uid = data.uid;

          getUser();
        }
      }).catch((error) => {
        reject({ error: "InvalidToken" });
      });
    } else {
      getUser();
    }

    function getUser() {
      // Let's now prepare permission object..
      permissions = helpers.permissions(permissions);

      // And now let's just get this user
      // and return information about it.
      let query = {
        $$storage: "users",
        $$findOne: true,

        _id: uid || identifier
      };

      axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
      .then((response) => {
        let data = response.data;

        if (data.error != "404") {
          // Now we need to filter this response
          // according to token's permissions.
          let profile = {};

          // Let's set the type of this object
          profile.type = "user";

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
      }).catch(() => {
        reject({ error: "ServerError" });
      });
    };
  });
};