// @section Import
// Here we'll import all modules and
// components we'll need.

const axios    = require('axios');
const config   = require('config');

const FormData = require('form-data');

const fs       = require('fs');

const helpers = {
  getToken: require('../../../helpers/tokens/get'),
  createToken: require('../../../helpers/tokens/create'),

  randomizer: require('../../../helpers/randomizer'),
  getApplication: require('./getApplication')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token, logo) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Let's firstly get this application
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      // Let's check if it's an application
      // token
      if (data.type == "appToken") {
        let appId = data.id;

        // First of all: we need to get application's data
        let query = {
          $$storage: "applications",
          $$findOne: true,

          _id: appId
        };

        axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
        .then((response) => {
          let application = response.data;
          
          if (application.error != "404") {
            // And now, when we got this application's data,
            // we need to upload this avatar and then
            // we'll update application's data.

            // Okay, so now we need to upload that file and
            // proceed to next steps.
            let tempPath = `./temporary/${helpers.randomizer(12)}.${logo.name.split('.')[1]}`;
            
            if (logo) {
              // Now we need to move that file somewhere.
              logo.mv(tempPath, (error) => {
                if (error) {
                  reject({ error: "ServerError" });
                } else {
                  // Here we'll create new FormData object
                  let formData = new FormData();
                  formData.append("image", fs.createReadStream(tempPath), logo.name);
          
                  // And here we'll send this file to internal server
                  axios.post(`${config.get('nodes.main.url')}/files/post/${config.get('nodes.main.key')}`, formData, 
                  { 
                    headers: formData.getHeaders() 
                  })
                  .then((response) => {
                    let logoToken = response.data.token;

                    // And now we need to update that application's
                    // data...
                    application.logotype = logoToken;
                    
                    axios.put(`${config.get('nodes.main.url')}/update/${config.get('nodes.main.key')}/${JSON.stringify(query)}`, application)
                    .then((response) => {
                      let data = response.data;

                      if (data.numberChanged > 0) {
                        helpers.getApplication(appId)
                        .then((response) => {
                          resolve(response);
                        }).catch(() => {
                          resolve({ changed: true });
                        });
                      } else {
                        reject({ error: "ServerError" });
                      }
                    }).catch(() => {
                      reject({ error: "ServerError" });
                    });
                  }).catch(() => {
                    reject({ error: "ServerError" });
                  });
                }
              });
            } else {
              reject({ error: "InvalidPayload", code: 400 });
            }
          } else {
            reject({ error: "InvalidApplication", code: 404 });
          };
        }).catch(() => {
          reject({ error: "ServerError" });
        });
      } else {
        reject({ error: "InvalidToken", code: 400 });
      }
    }).catch((error) => {
      reject({ error: error == "NotFound" ? "InvalidToken" : "ServerError", code: error == "NotFound" ? 404 : 500 });
    });
  });
};