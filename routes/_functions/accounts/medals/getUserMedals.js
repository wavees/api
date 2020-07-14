// @section Import
// Here we'll import all modules and
// components we'll need.

const axios   = require('axios');
const config  = require('config');

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (id) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's now just get all user medals.
    let query = {
      $$storage: "medals",

      type: "secondary",
      uid: id
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;
      
      let medals = [];
      if (data.length >= 1) {
        data.forEach((object) => {
          medals.push({ mid: object._id, pid: object.pid });
        });
      };
      resolve(medals);
    }).catch(() => {
      reject({ error: "ServerErorr" });
    })
  });
};