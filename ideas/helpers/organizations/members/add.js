const axios  = require('axios');
const config = require('config');
const moment = require('moment');

module.exports = (uid, oid) => {
  return new Promise((resolve, reject) => {

    // Let's just add user with this UID to organization with this OID
    // (We won't check for User and Organization existance);
    let membership = {
      $$storage: "ideas-membership",

      type: "membership",
      uid, oid,

      joined: moment().unix()
    };

    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`, membership)
    .then((response) => {
      resolve(response.data.document);
    }).catch((error) => {
      reject({ status: 500, error: "ServerError" });
    });
  });
};