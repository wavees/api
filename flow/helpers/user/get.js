const axios    = require('axios');
const config   = require('config');

const getChats = require('../chats/getAll');

module.exports = (uid) => {
  return new Promise((resolve, reject) => {
    // Let's now prepare our request.
    let request = {
      $$storage: "flow-users",
      $$findOne: true,

      _id: uid
    };

    // And now let's make our request.
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      const data = response.data;

      if (data.error == "404") {
        reject({ status: 404, error: "NotFound" });
      } else {
        // Here we'll prepare our user object and return
        // it back. 
        const user = {
          type: "userAccount",

          uid: data._id,

          name: data.name,
          avatar: data.avatar,

          registerDate: data.registerDate,
        };

        resolve(user);
      };
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};