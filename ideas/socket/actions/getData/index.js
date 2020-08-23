const getUser      = require('./user/getUser');
const checkData    = require('./checkData');
const getFollowers = require('./user/getFollowers');

module.exports = (data) => {
  return new Promise((resolve, reject) => {
    // Let's now check this data type.
    if (data.type == "userData") {
      getUser(data.uid)
      .then((response) => {
        resolve(response);
      }).catch((error) => {
        resolve(error);
      });
    } else if (data.type == "checkData") {
      checkData(data.id)
      .then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    }
  });
};