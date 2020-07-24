// Helper function, that'll apply
// one medal to user account.
// And it'll return id of
// this new user medal as well.

// Let's firstly import some modules.
const axios   = require('axios');
const config  = require('config')

const helpers = {
  permissions: require('../permissions/index'),
  getToken: require('../tokens/get'),

  shifter: require('../../routes/_functions/accounts/medals/shifter')
};

module.exports = (token, id) => {
  // Let's return our promise.
  return new Promise((resolve, reject) => {
    // And now let's, by the way, get
    // our user.
    helpers.getToken(token)
    .then((response) => {
      let user = response.data;

      // Here we'll check if it's user
      // or no.
      if (user.type == "user") {
        // And now we need to check if
        // this medal exists at all.
        let query = {
          $$findOne: true,
          $$storage: "medals",

          _id: id
        }

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
        .then((response) => {
          let data = response.data;
        
          // Let's check type of this medal...
          if (data.type == "primary") {
            // And now we need to "apply" this medal to
            // this user.
            let medal = {
              $$storage: "medals",

              type: "secondary",
              
              // Medal information:
              title: data.title,
              subtitle: data.subtitle,

              time: new Date(),

              // Initial information:
              uid: user.uid,
              pid: data._id
            };

            axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, medal)
            .then((response) => {
              let data = response.data.document;

              // And let's force player to agree
              // to this medal.
              helpers.shifter(token, data._id)

              // And now let's return some information
              // to our main promise...
              resolve({ id: data._id })
            }).catch((error) => {
              reject({ error: "ServerError" });
            });
          } else {
            reject({ error: "ServerError" });
          };
        }).catch(() => {
          reject({ error: "ServerError" });
        });
      } else {
        reject({ error: "NotFound", code: 404 });
      };
    }).catch(() => {
      reject({ error: "ServerError" });
    })
  });
};