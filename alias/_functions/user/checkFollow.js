// Importing modules
const axios  = require('axios');
const config = require('config');

// And now let's just export our main
// function
module.exports = (uid, aid) => {
  return new Promise((resolve, reject) => {
    // Here we'll make our request to
    // datastore application and check
    // if user with id UID follows
    // author with id AID

    let request = {
      $$storage: "blog-follows",
      $$findOne: true,

      uid: uid,
      aid: aid
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        resolve({ follows: false });
      } else {
        resolve({ follows: true });
      };
    }).catch(() => {
      resolve({ follows: false });
    });
  });
};