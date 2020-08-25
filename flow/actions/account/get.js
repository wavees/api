const getToken = require('../../helpers/tokens/get');

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    getToken(token)
    .then((response) => {
      if (response.type == "userAccount") {
        resolve(response);
      } else {
        reject({ status: 400, error: "InvalidUserToken" });
      };
    }).catch(() => {
      reject({ status: 400, error: "InvalidToken" });
    });
  });
};