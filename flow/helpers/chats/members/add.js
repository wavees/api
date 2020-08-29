const axios  = require('axios');
const config = require('config');
const events = require('../../../events');

const moment = require('moment');

module.exports = (cid, uid) => {
  return new Promise((resolve, reject) => {
    // Let's firstly prepare our membership
    // object.
    const membership = {
      $$storage: "flow-chatMembership",

      type: "membership",

      cid: cid,
      uid: uid,

      joined: moment().unix()
    };

    // And now let's post this to our database.
    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, membership)
    .then((response) => {
      events.emit(`chat/joined`, { chat: cid, user: uid });
  
      resolve({
        type: "membership",

        cid: cid,
        uid: uid,

        joined: membership.joined
      });
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};