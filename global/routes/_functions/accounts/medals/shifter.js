// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');
const e = require('express');

const helpers = {
  permissions: require('../../../../helpers/permissions/index'),
  getToken: require('../../../../helpers/tokens/get')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token, id) => {

  // Let's return promise...
  return new Promise((resolve, reject) => {
    // Let's firtsly get this user...
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;
      // And now let's check if it's user
      // or no.
      if (data.type == "user") {
        // Let's now check if user agreed
        // or disagreed this medal...
        let query = {
          $$findOne: true,
          $$storage: "medals-shifter",

          uid: data.uid,
          mid: id
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
        .then((response) => {
          let data = response.data;
        
          // Let's now determine what we should do next...
          let type;
          
          if (data.error == null) {
            if (data != {}) {
              type = "disagree";
            } else {
              type = "agree";
            };
          } else {
            type = "agree";
          };

          // And now let's do something...
          if (type == "agree") {
            // And now we need to agree to this medal...
            query.time = new Date();
            axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, query)
            .then((response) => {
              let data = response.data;

              // And now let's just return
              // some info to the main promise.
              resolve({ type: "agree" });
            }).catch(() => {
              reject({ error: "ServerError" });
            });
          } else {
            // Let's delete this...
            axios.delete(`${config.get('nodes.main.url')}/delete/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
            .then((response) => {
              let data = response.data;

              // And now let's just resolve the
              // main promise.
              resolve({ type: "disagree" })
            }).catch((error) => {
              reject({ error: "ServerError" })
            });
          }
        }).catch((error) => {
          reject({ error: "ServerError" });
        });
      } else {
        reject({ error: "InvalidToken", code: 400 });
      }
    }).catch(() => {
      reject({ error: "ServerError" });
    });
  });
};