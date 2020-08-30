const axios     = require('axios');
const config    = require('config');
const moment    = require('moment');

const addMember = require('./members/add');

module.exports = (uid, data) => {
  return new Promise((resolve, reject) => {

    let avatars = [
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/dog_1f415.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/dog-face_1f436.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/unicorn-face_1f984.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/llama_1f999.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/koala_1f428.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/panda-face_1f43c.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/bird_1f426.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/baby-chick_1f424.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/duck_1f986.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/eagle_1f985.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/snake_1f40d.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/parrot_1f99c.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/dolphin_1f42c.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/wilted-flower_1f940.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/cloud_2601.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/cloud-with-tornado_1f32a.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/christmas-tree_1f384.png",
      "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/237/pine-decoration_1f38d.png"
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