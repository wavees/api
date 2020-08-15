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
    let userData = {};
    let uid = identifier;

    // @type token
    if (type == "token") {
      helpers.getToken(identifier)
      .then((response) => {
        let data = response.data;

        if (data.type == "user") {
          // Let's read this token's permissions
          uid = data.uid;
          userData = data;

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
      if (userData.permissions == null) {
        permissions = helpers.permissions(...permissions);
      } else {
        permissions = helpers.permissions(...permissions, ...userData.permissions);
      };

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

          // User Provider
          profile.provider = data.provider || "wavees";

          // @permission: readEmail
          profile.email    = permissions.has("readEmail") ? data.email : null;

          // @permission: readAvatar
          if (profile.provider == "discord") {
            profile.avatar   = permissions.has("readAvatar") ? `https://cdn.discordapp.com/avatars/${data.dId}/${data.avatar.url}.png` : null;
          } else {
            profile.avatar   = permissions.has("readAvatar") ? `${config.get('api.avatars')}/${data.avatar}` : null;
          };

          // @permission: readUsername
          profile.username = permissions.has("readUsername") ? data.username : null;

          // @permission: getCoins
          profile.coins    = permissions.has("getCoins") ? data.coins == null ? 100 : data.coins : null;

          // @uid
          profile.uid = data._id;

          // Provider-related data.
          // @provider Discord
          if (profile.provider == "discord") {
            // Discord User Id
            profile.discord = {};
            profile.discord.id    = permissions.has("getProviderId") ? data.dId : null;

            // Access Token.
            profile.discord.token = permissions.has("getProviderToken") ? data.discord.token : null

            // And now let's check if we need to
            // refresh our access token or no.

            // *in future*
          };

          resolve(profile);
        } else {
          reject({ error: "InvalidToken" });
        }
      }).catch((error) => {
        console.log(error);
        reject({ error: "ServerError" });
      });
    };
  });
};