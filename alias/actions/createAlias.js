const getToken = require('../helpers/tokens/get');
const config   = require('config');
const axios    = require('axios');
const cache    = require('apicache');

const moment   = require('moment');

module.exports = (token, body) => {
  return new Promise((resolve, reject) => {
    // Let's firstly get our token.
    getToken(token)
    .then((response) => {
      // And now let's check this
      // token's information...
      if (response.type == "appToken") {
        const application = response.data.application;

        // Now we need to prepare our token
        // and it's settings...
        const settings = {
          atomic: body.settings.atomic || false,
          atomicIdentificator: body.settings.atomicIdentificator
        };

        if (settings.atomic) {
          // Firstly let's check if this alias
          // isn't taken.
          let request = {
            $$storage: `aliases-${application.id}`,
            $$findOne: true,

            alias: body.alias
          };

          axios.get(`${config.get("nodes.main.url")}/get/${config.get("nodes.main.key")}/${JSON.stringify(request)}`)
          .then((response) => {
            let data = response.data;

            if (data.error == "404") {
              
              // And now we need to check if we need
              // to CHANGE this alias or to CREATE NEW entry.

              let request = {
                $$storage: `aliases-${application.id}`,
                $$findOne: true,
              };

              request[`data.${settings.atomicIdentificator}`] = body.data[settings.atomicIdentificator];

              axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
              .then((response) => {
                let data = response.data;

                // By the way, now we need to uncache information
                // about pervios alias...
                cache.clear(`alias/${body.alias}`);
                cache.clear(`alias/${data.alias}`);

                if (data.error == "404") {

                  // Here we'll just create our
                  // new alias.
                  let entry = {
                    $$storage: `aliases-${application.id}`,
        
                    alias: body.alias,
                    updateTime: moment().unix(),
        
                    data: body.data
                  };
        
                  axios.post(`${config.get("nodes.main.url")}/post/${config.get("nodes.main.key")}`, entry)
                  .then((response) => {
                    let data = response.data;
        
                    resolve(data.document);
                  }).catch(() => {
                    reject({ status: 500, error: "ServerError" });
                  });

                } else {
                  // And here we'll just change our alias.
                  let entry = data;

                  entry.alias           = body.alias;
                  entry.updateTime = moment().unix();

                  axios.put(`${config.get("nodes.main.url")}/update/${config.get("nodes.main.key")}/${JSON.stringify(request)}`, entry)
                  .then(() => {
                    resolve(entry);
                  }).catch(() => {
                    reject({ error: "ServerError" });
                  });
                };
              }).catch(() => {
                reject({ status: 500, error: "ServerError" });
              });
            } else {
              reject({ status: 400, error: "AlreadyPicked" });
            };
          }).catch(() => {
            reject({ status: 500, error: "ServerError" });
          });
        } else {
          // Let's just create our alias...
          let entry = {
            $$storage: `aliases-${application.id}`,

            alias: body.alias,
            updateTime: moment().unix(),

            data: body.data
          };

          // Uncaching previous entry...
          cache.clear(`alias/${body.alias}`);

          axios.post(`${config.get("nodes.main.url")}/post/${config.get("nodes.main.key")}`, entry)
          .then((response) => {
            let data = response.data;

            resolve(data.document);
          }).catch(() => {
            reject({ status: 500, error: "ServerError" });
          });
        };
      } else {
        reject({ status: 500, error: "InvalidToken" });
      };
    }).catch((error) => {
      reject(error);
    });
  });
};