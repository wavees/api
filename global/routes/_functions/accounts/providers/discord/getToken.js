// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

const helpers = {
  permissions: require('../../../../../helpers/permissions/index'),
  getToken: require('../../../../../helpers/tokens/get'),

  createToken: require('../../../../../helpers/tokens/create')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (code) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // First of all: Let's exchange this
    // code to access token.
    let body = {
      client_id: "740588352117538848",
      client_secret: "9H2pGQx4Y3gav0mI_4_oVZ3NSsn4sePB",
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3000/provider/discord",
      code: code,
      scope: "identify email"
    };

    axios.post("https://discord.com/api/oauth2/token", new URLSearchParams(body), { headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }}).then((response) => {
      let discord = response.data;

      // Let's now get information about this user.
      axios.get("https://discord.com/api/users/@me", { 
        headers: {
          'Authorization': `Bearer ${discord.access_token}`
        }
      }).then((response) => {
        let user = response.data;

        // And now let's check if we registered
        // this user in our system or no.
        let body = {
          $$storage: "users",
          $$findOne: true,

          dId: user.id
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(body)}`)
        .then((response) => {
          let data = response.data;

          if (data.error == "404") {
            // So, now we need to create this
            // user account and then create
            // token for this user.
            let profile = {
              $$storage: "users",

              dId: user.id,
              provider: "discord",

              username: user.username,
              email: user.email,
              avatar: {
                type: "discord",
                url: user.avatar
              },

              discord: {
                token: discord.access_token,
                refresh_token: discord.refresh_token,
              }
            };

            axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, profile)
            .then((response) => {
              let data = response.data.document;

              let token = {
                uid: data._id,
                type: "user"
              };

              helpers.createToken(token)
              .then((response) => {
                // And now let's just return this token.
                resolve({ token: response.token });
              }).catch((error) => {
                reject(error);
              });
            }).catch((error) => {
              reject({ error: "ServerError" });
            });
          } else {
            // Let's now just create token for
            // this user and return it.
            let token = {
              uid: data._id,
              type: "user"
            };

            helpers.createToken(token)
            .then((response) => {
              resolve({ token: response.token });
            }).catch((error) => {
              reject(error);
            });
          }
        }).catch((error) => {
          console.log("Error 1");
          console.log(error);
          reject({ error: "ServerError" });
        });
      }).catch((error) => {
        console.log("error 2");
        console.log(error);
        reject({ error: "DiscordUserError" });
      });
    }).catch((error) => {
      console.log(error);
      reject({ data: error.data, data2: error, error: "DiscordError" });
    });
  });
};