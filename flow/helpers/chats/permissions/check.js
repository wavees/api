const axios  = require('axios');
const config = require('config');

module.exports = (uid, cid, pid) => {
  return new Promise((resolve, reject) => {
    // Let's just get information about this permission.
    let query = {
      $$storage: "flow-permissions",
      $$findOne: true,

      // User Id
      uid,

      // Chat Id,
      cid,

      // Permisison id
      permisison: pid
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      const data = response.data;

      if (data.error == "404") {
        // And now let's check the default value
        // of this permission.
        let permissions = config.get('permissions');
        let permission  = permissions.find((x) => x.id == pid) || {};

        resolve({
          type: "permission",
          
          uid,cid,
          
          permission: pid,
          granted: permission.default || false
        });
      } else {
        // And now let's just response with
        // our values...
        if (data.granted) {
          resolve({
            type: "permission",
            
            uid,cid,
            
            permission: pid,
            granted: true
          });
        } else {
          resolve({
            type: "permission",
            
            uid,cid,
            
            permission: pid,
            granted: false
          });
        };
      };
    })
    .catch((error) => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};