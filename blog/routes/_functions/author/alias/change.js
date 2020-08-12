// Importing modules
const axios  = require('axios');
const config = require('config');

const moment = require('moment');

// And now let's just export our main
// function
module.exports = (token, alias) => {
  return new Promise((resolve, reject) => {

    // So, firstly we need to check
    // this token's permissions.
    axios.get(`${config.get("api.url")}/${config.get("api.version")}/token/${token}/permissions`)
    .then((response) => {
      let permissions = response.data;

      // Let's now check!
      if (permissions.includes("blog/changeAlias")) {
        // And now let's just change our alias
        // in our database!

        // But firstly we need to get user's
        // id, that is stored in this token.
        axios.get(`${config.get('api.url')}/${config.get("api.version")}/account/${token}`)
        .then((response) => {
          let user = response.data;

          if (user.type == "user") {
            const uid = user.uid;
            // And now let's continue:

            // Now we need to check if we need to update
            // or to create new alias entry in our database.
            let body = {
              $$storage: "blog-aliases",
              $$findOne: true,


            };

            axios.get(`${config.get('nodes.main.url')}/get/${config.get("nodes.main.key")}/${JSON.stringify(body)}`)
            .then((response) => {
              let data = response.data;

              if (data.error == "404") {
                // We need to create new entry.
                let entry = {
                  $$storage: "blog-aliases",

                  alias: alias,
                  updateTime: moment().unix(),

                  uid: uid
                };

                axios.post(`${config.get("nodes.main.url")}/post/${config.get("nodes.main.key")}`, entry)
                .then((response) => {
                  let data = response.data;

                  resolve(data.document);
                }).catch(() => {
                  reject({ error: "ServerError" });
                });
              } else {
                // Now we need to update existing
                // entry.
                let entry = data;

                entry.alias      = alias;
                entry.updateTime = moment().unix();
              
                axios.put(`${config.get("nodes.main.url")}/update/${config.get("nodes.main.key")}/${JSON.stringify(body)}`, entry)
                .then(() => {
                  resolve(entry);
                }).catch(() => {
                  reject({ error: "ServerError" });
                })
              };
            }).catch(() => {
              reject({ error: "ServerError" });
            });
          } else {
            reject({ status: 400, error: "InvalidToken" });
          };
        })
        .catch(() => {
          reject({ error: "ServerError" });
        });

      } else {
        reject({ status: 400, error: "InsufficientPermission" });
      };
    }).catch((error) => {

      console.log(error);
      reject({ error: "ServerError" });
    });

    // // First
    // let request = {
    //   $$storage: "blog-aliases",
    //   $$findOne: true,

    //   alias: alias
    // };

    // axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(request)}`)
    // .then((response) => {
    //   let data = response.data;

    //   if (data.error == "404") {
    //     reject({ status: 404, error: "NotFound" });
    //   } else {
    //     resolve(data);
    //   };
    // }).catch(() => {
    //   reject({ error: "ServerError" });
    // });
  });
};