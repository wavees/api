const axios  = require('axios');
const config = require('config');

module.exports = (oid) => {
  return new Promise((resolve, reject) => {
    let query = {
      $$storage: "ideas-organizations",
      $$findOne: true,

      _id: oid
    };
    
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        resolve({ status: 404, error: "NotFound" });    
      } else {
        let organization = {
          id: data._id,

          type: data.type || "Normal",
          name: data.name,

          ownerId: data.ownerId
        };

        resolve(organization);
      }
    }).catch(() => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};