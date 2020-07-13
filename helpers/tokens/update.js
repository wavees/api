const config = require('config');
const axios  = require('axios');

const randomizer = require('../randomizer');

module.exports = (token, newData) => {
  return new Promise((resolve, reject) => {
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"tokens","token":"${token}"}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        reject("NotFound");
      } else {
        // update token with new data
        let query = {
          $$storage: "tokens",

          _id: data._id
        };

        let body = response.data;
        body.data = newData;

        axios.put(`${config.get('nodes.main.url')}/update/${config.get('nodes.main.key')}/${JSON.stringify(query)}`, body)
        .then((response) => {
          let data = response.data;

          if (data.state) {
            resolve(newData)
          } else {
            console.log(data);
            reject("ServerError");
          }
        })
        .catch((error) => {
          console.log(error);
          reject("ServerError");
        });
      }
    })
    .catch(() => {
      reject("ServerError")
    });
    // axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`,
    // {
    //   $$storage: "tokens",

    //   token: randomizer(12),
    //   data: data
    // })
    // .then((response) => {
    //   resolve(response.data.document);
    // })
    // .catch(() => {
    //   reject("ServerError");
    // });
  });
};