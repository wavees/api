const axios    = require('axios');
const config   = require('config');
const FormData = require('form-data');

const helpers = {
  getToken: require('../tokens/get'),
  updateToken: require('../tokens/update')
};

module.exports = (token, file) => {
  return new Promise((resolve, reject) => {
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      if (data.type == "user") {
        // formData
        // console.log(file);
        let formData = new FormData();
        formData.append("image", file.data);

        axios.post(`${config.get('nodes.main.url')}/files/post/${config.get('nodes.main.key')}`, formData)
        .then((response) => {
          let data = response.data;

          console.log(data);
          resolve(data);
        }).catch((error) => {
          console.log('error 1');
          console.log(error);
          reject("ServerError");
        });
      } else {
        reject("InvalidToken");
      }
    }).catch((error) => {
      console.log('erro 2');
      console.log(error);

      reject("ServerError");
    });
  })
};