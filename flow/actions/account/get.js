const getToken = require('../../helpers/tokens/get');
const getUser  = require('../../helpers/user/get');

module.exports = (token) => {
  return new Promise((resolve, reject) => {

    // Let's now check lenght of
    // our token (is it an user token or an
    // user id)

    if (token.split('').length > 10) {
      getUser(token)
      .then((response) => {
        let user = response;
        user.token = undefined;

        resolve(user);
      }).catch(() => {
        reject({ status: 400, error: "InvalidUserId" });
      });
    } else {
      getToken(token)
      .then((response) => {
        if (response.type == "userAccount") {
          let user = response;
          user.token = token;

          resolve(user);
        } else {
          reject({ status: 400, error: "InvalidUserToken" });
        };
      }).catch(() => {
        reject({ status: 400, error: "InvalidToken" });
      });
    ;}
  });
};