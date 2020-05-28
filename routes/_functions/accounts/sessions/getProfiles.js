// @section Import
// Here we'll import all modules and
// components we'll need.

// Helpers
const helpers = {
  getToken: require('../../../../helpers/tokens/get')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (token) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    helpers.getToken(token)
    .then((response) => {
      let data = response.data;

      if (data.type == "session") {
        let profiles = data.profiles;

        if (profiles.length > 0) {
          resolve({ current: data.current, profiles: profiles });
        } else {
          reject({ error: "NotFound" });
        }
      } else {
        reject({ error: "InvalidToken" });
      }
    })
    .catch(() => {
      reject({ error: "InvalidToken" });
    });
  });
};