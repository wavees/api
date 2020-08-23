// Importing modules
const axios  = require('axios');
const config = require('config');
const moment = require('moment');

const checkFollow = require('./checkFollow.js');

// And now let's just export our main
// function
module.exports = (uid, aid) => {
  return new Promise((resolve, reject) => {
    // Let's check if user with id UID
    // follows author with id AID.

    checkFollow(uid, aid)
    .then((response) => {
      // Let's unfollow this user.
      if (response.follows) {
        let body = {
          $$storage: "blog-follows",
          
          uid: uid,
          aid: aid
        };

        axios.delete(`${config.get('nodes.main.url')}/delete/${config.get('nodes.main.key')}/${JSON.stringify(body)}`)
        .then(() => {
          resolve({ follows: false });
        }).catch(() => {
          reject({ error: "ServerError" });
        });

      // And now let's follow this user.
      } else {
        let body = {
          $$storage: "blog-follows",

          uid: uid,
          aid: aid,

          time: moment().unix()
        };
        
        axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, body)
        .then((response) => {
          let data = response.data;

          resolve(data.document);
        }).catch((error) => {
          reject({ error: error.data });
        });
      };
    });
  });
};