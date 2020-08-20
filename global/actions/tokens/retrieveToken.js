const getToken       = require('../../helpers/tokens/get');
const getUser        = require('../../helpers/user/get');
const getApplication = require('../../helpers/applications/get');

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    getToken(token)
    .then((response) => {
      // 
      // And let's now 
      const data = response.data;

      if (data.type == "user") {

        // Let's prepare our tokenData object
        let tokenData = {
          token: token,
          type: data.type || "undefinedType",

          data: {
            permissions: data.permissions
          }
        };

        // And now we need to get some information
        // about this user.
        getUser(token)
        .then((response) => {
          tokenData.data.user = response;

          resolve(tokenData);
        }).catch((error) => {
          if (error == "NotFound") {
            tokenData.data.user = {
              id: data.id,

              status: "error",
              errorCode: "404",
              error: "UserNotFound"
            };
          } else if (error == "ServerError") {
            tokenData.data.user = {
              id: data.id,

              status: "error",
              errorCode: "500",
              error: "ServerError"
            };
          };

          resolve(tokenData);
        });
      } else if (data.type == "appToken") {

        // Let's prepare our tokenData object
        let tokenData = {
          token: token,
          type: data.type || "undefinedType",

          data: {
            permissions: data.permissions
          }
        };

        // And now we need to get some information
        // about this applicaiton.
        getApplication(data.id)
        .then((response) => {
          tokenData.data.application = response;

          resolve(tokenData);
        }).catch((error) => {
          if (error == "NotFound") {
            tokenData.data.application = {
              id: data.id,

              status: "error",
              errorCode: "404",
              error: "ApplicationNotFound"
            };
          } else if (error == "ServerError") {
            tokenData.data.application = {
              id: data.id,

              status: "error",
              errorCode: "500",
              error: "ServerError"
            };
          };

          resolve(tokenData);
        });
      } else {
        resolve(tokenData);
      };
    }).catch((error) => {
      if (error == "NotFound") {
        reject({ status: 404, error: "NotFound" });
      } else {
        reject({ status: 500, error: "ServerError" });
      }
    });
  });
};