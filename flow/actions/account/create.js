const createToken = require('../../helpers/tokens/create')
const axios       = require('axios');
const config      = require('config');

module.exports = (data) => {
  return new Promise((resolve, reject) => {
    // Let's now prepare our user information...
    let user = {
      $$storage: "flow-users",

      type: "userAccount",
      name: data.name
    };

    // Let's now create this user.
    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, user)
    .then((response) => {
      const data = response.data.document;

      // And now let's create new token for this user...
      const token = {
        type: "user",

        uid: data._id
      };

      createToken(token)
      .then((response) => {
        resolve({
          token: response,
          user: {
            uid: data._id,

            ...user
          }
        });
      }).catch((error) => {
        console.log("ERRRO 1");
        console.log(error);
        reject(error);
      });
    }).catch((error) => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};