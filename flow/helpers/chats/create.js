const axios     = require('axios');
const config    = require('config');
const moment    = require('moment');

const addMember = require('./members/add');

module.exports = (uid, data) => {
  return new Promise((resolve, reject) => {

    let avatars = [
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/grinning-face_1f600.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/rolling-on-the-floor-laughing_1f923.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/upside-down-face_1f643.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/face-throwing-a-kiss_1f618.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/grinning-face-with-one-large-and-one-small-eye_1f92a.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/hugging-face_1f917.png"
    ];

    // And now let's prepare our chat information
    // and create new chat...
    const chat = {
      $$storage: "flow-chats",

      ownerId: uid,
      name: data.name,

      creationDate: moment().unix(),
      avatar: avatars[Math.floor(Math.random() * avatars.length)],

      members: [uid]
    };

    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, chat)
    .then((response) => {
      // And now let's add this user to
      // this chat...
      chat.id = response.data.document._id;

      addMember(response.data.document._id, uid)
      .then((response) => {
        resolve({
          membership: response,
          chat: chat
        });
      }).catch(() => {
        reject({ status: 500, error: "ServerError" });
      });
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};