// @section Import
// Here we'll import all modules and
// components we'll need.

// Data validation
const Joi     = require("@hapi/joi");

// HTTP Requests
const axios   = require('axios');

// Configs
const config  = require('config');

// Helpers
const helpers = {
  createToken: require('../../../../helpers/tokens/create')
};

// @section export
// And now we need to export function,
// that'll handle this action.
module.exports = (body) => {
  // Let's return promise...

  return new Promise((resolve, reject) => {
    // Joi schema generation
    const schema = Joi.object({
      profiles: Joi.array().required()
    });

    // Let's validate this schema
    const validation = schema.validate(body);
    if (validation.error != null) return reject({ error: "InvalidPayload" });
  
    // Let's check all user profiles and
    // then let's create this session.
    let profiles = [];
    body.profiles.forEach((profile) => {
      profiles.push({ token: profile });
    });

    // Generating query
    let query = {
      $$storage: "tokens",
      $or: profiles
    };

    // Making request...
    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        reject({ error: "InvalidSession", code: 404 });
      } else {
        // Get and sort all user profiles
        // by their tokens
        let verifiedProfiles = [];

        data.forEach((profile) => {
          verifiedProfiles.push(profile.token);
        });

        // Create new session and send it's id
        // back to user.
        data = {
          type: "session",

          current: profiles[0] == null ? null : profiles[0],
          profiles: verifiedProfiles
        };

        helpers.createToken(data)
        .then((response) => {
          resolve({ token: response.token, profiles: response.profiles });
        })
        .catch(() => {
          reject({ error: "ServerError", code: 500 });
        });
      };
    })
    .catch(() => {
      reject({ error: "ServerError", code: 500 });
    });
  });
};