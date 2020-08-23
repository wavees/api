const axios        = require('axios');
const config       = require('config');

const getAlias     = require('../../../../helpers/alias/get');
const getFollowers = require('../../../../helpers/author/getFollowers');


module.exports = (id) => {
  return new Promise((resolve, reject) => {
    // Let's just gather some information about
    // this user.
    let returnData = {
      dataType: "userData"
    };

    // Let's now check if it's an Alias
    // or no
    axios.get(`${config.get('apiAlias.url')}/${config.get('apiAlias.version')}/${config.get('application.id')}/alias/${id}`)
    .then((response) => {
      let data = response.data;

      if (data.data.uid != null) {
        getUser(data.data.uid);
      } else {
        returnData.error = "NotFound";
        resolve(returnData);
      };
    }).catch(() => {
      getUser(id);
    });

    function getUser(uid) {
      axios.get(`${config.get('api.url')}/${config.get('api.version')}/user/${uid}`)
      .then((response) => {
        returnData.data = response.data;

        // Let's now get user's Alias and then Followers Count.
        getFollowers(uid)
        .then((response) => {
          returnData.data.followers = response;

          // And now we need to try and get
          // user's alias.

          getAlias(uid)
          .then((response) => {
            returnData.data.alias = response;

            resolve(returnData);
          }).catch((error) => {
            resolve(returnData);
          });
        }).catch(() => {
          resolve(returnData);
        });
      }).catch(() => {
        returnData.state = "error";

        resolve(returnData);
      });
    };
  });
};