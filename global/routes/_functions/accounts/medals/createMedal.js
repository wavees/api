// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

const helpers = {
  permissions: require('../../../../helpers/permissions/index'),
  getToken: require('../../../../helpers/tokens/get'),

  applyMedal: require('../../../../helpers/medals/applyMedal')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token, body) => {

  // Let's return promise...
  return new Promise((resolve, reject) => {
    // Firstly we need to get this
    // token and check it's permissions.
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;
      // And now let's check if it's
      // an user token or no.
      if (data.type == "user") {
        // Let's now check permissions.
        let permissions = config.get('permissions.default');
        if (data.permission) {
          permissions.push(data.permissions);
        };

        permissions = helpers.permissions(permissions);

        // And now let's check it...
        if (permissions.has("createMedal")) {
          // Finally, let's create our medal!
          
          // Let's firstly check for medal
          // data.
          let medal = {
            // Title and subtitle.
            title: body.title,
            subtitle: body.subtitle,

            // Id of our creator.
            creatorId: data.uid,

            // Creation date.
            createTime: new Date(),

            // Maximum uses.
            // zero = infinite
            maximumUses: 0
          };

          if (medal.title == null || medal.subtitle == null) return reject({ error: "WrongPayload", code: 400 });

          // And now let's update our database with
          // this brand-new medal.
          medal.type = "primary";
          medal.$$storage = "medals";

          axios.post(`${config.get("nodes.main.url")}/post/${config.get('nodes.main.key')}`, medal)
          .then((response) => {
            let data = response.data.document;

            // And now, by the way, we need to
            // apply this medal to
            // this user.
            helpers.applyMedal(token, data._id)
            .then((response) => {
              // And now let's just return some
              // info to our main promise.
              let userMedal = {
                title: medal.title,
                subtitle: medal.subtitle,
                
                time: medal.time,

                creatorId: medal.creatorId,
                createTime: medal.createTime,

                maximumUses: medal.maximumUses,
                
                pid: data._id,
                mid: response.id
              };

              resolve(userMedal);
            }).catch((error) => {
              reject({ error: "ServerError" });
            });
          }).catch((error) => {
            console.log(error);
            reject({ error: "ServerError" });
          });
        } else {
          reject({ error: "InsufficientPermission", code: 400 });
        }
      } else {
        reject({ error: "NotFound", code: 404 });
      }
    }).catch((error) => {
      reject({ error, code: error == "NotFound" ? 404 : null });
    });
  });
};