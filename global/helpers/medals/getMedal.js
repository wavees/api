// Helper function, that'll
// get and return medal info.

// Let's firstly import some modules.
const axios   = require('axios');
const config  = require('config');
const c = require('config');
const e = require('express');

module.exports = (id) => {
  // Let's return our promise.
  return new Promise((resolve, reject) => {
    // Let's now get our medal.
    let query = {
      $$findOne: true,
      $$storage: "medals",

      _id: id
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;

      let medal = {};

      // And now let's process this
      // medal.
      if (data.type == "primary") {
        // Medal type
        medal.type = "primary",

        // Visual medal Information.
        medal.title = data.title;
        medal.subtitle = data.subtitle;

        // Creator info
        medal.creatorId = data.creatorId;
        medal.createTime = data.createTime;

        // MaximumUses
        medal.maximumUses = data.maximumUses;

        // Id
        medal.id = data._id;

        // And now let's just resolve
        // this promise with medal
        // information.
        resolve(medal);
      } else if (data.type == "secondary") {
        // Medal type
        medal.type = "secondary";

        // Visual medal information.
        medal.title = data.title;
        medal.subtitle = data.subtitle;

        // Parent medal and UId.
        medal.uid = data.uid;
        medal.pid = data.pid;

        // id
        medal.id = data._id;

        // Let's now, by the way, get all
        // player's, that agree to this medal.
        let query = {
          $$storage: "medals-shifter",

          mid: medal.id
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
        .then((response) => {
          let data = response.data;

          // And now let's sort this array
          // and finally let's return
          // all information about this medal.
          let agreed = [];
          if (data.length >= 1) {
            data.forEach((object) => {
              agreed.push(object.uid);
            });
          };
          medal.agreed = agreed;

          resolve(medal);
        }).catch((error) => {
          reject({ error: "ServerError" });
        });
      } else {
        return reject({ error: "NotFound", code: 404 });
      };
    }).catch((error) => {
      reject({ error: "ServerError" });
    });
  });
};