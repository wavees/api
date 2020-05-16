const router  = require('express').Router();
const axios   = require('axios');

const config  = require('config');
const Joi     = require("@hapi/joi");

const helpers = {
  createToken: require('../helpers/tokens/create'),
  getToken: require('../helpers/tokens/get'),
  updateToken: require('../helpers/tokens/update'),

  randomizer: require('../helpers/randomizer'),
  removeFromArray: require('../helpers/removeFromArray')
};

// 
// DELETE /accounts/:token
// Delete ONE profile from session
// 
router.delete('/:token', (req, res) => {
  let token = req.params.token;
  let body  = req.body;

  if (body.token == null) return res.status(400).end(JSON.stringify({ error: "WrongPayload" }))

  helpers.getToken(token)
  .then((response) => {
    if (response.data.type == "session") {
      // Update token.
      let data = response.data;
      data.profiles = helpers.removeFromArray(data.profiles, body.token);

      helpers.updateToken(token, data)
      .then((response) => {
        res.end(JSON.stringify(response));
      })
      .catch((eror) => {
        res.status(500).end(JSON.stringify({ error: "ServerError", message: error }));
      })
    } else {
      res.status(400).end(JSON.stringify({ error: "WrongPayload" }));
    }
  })
  .catch((error) => {
    res.status(500).end(JSON.stringify({ error: "ServerError", message: error }));
  })
});


// 
// POST /accounts/multi
// Creates new user session.
// 
router.post('/', (req, res) => {
  let body = req.body;

  const schema = Joi.object({
    // token: Joi.string().required(),
    profiles: Joi.array().required()
  });

  const validation = schema.validate(body);
  if (validation.error != null) {
    res.status(400).end(JSON.stringify({ error: "WrongPayload", message: validation.error }))
  } else {
    // Let's check all user profiles and
    // then let's create this session.
    let profiles = [];
    body.profiles.forEach((profile) => {
      profiles.push({ token: profile });
    });

    let query = {
      $$storage: "tokens",
      $or: profiles
    };

    axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
    .then((response) => {
      let data = response.data;

      if (data.error == "404") {
        res.status(500).end(JSON.stringify({ error: "ServerError" }))
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
          res.end(JSON.stringify({ token: response.token, profiles: response.profiles }))
        })
        .catch((error) => {
          res.status(500).end(JSON.stringify({ error: "ServerError" }));
        });
      };
    })
    .catch((error) => {
      res.status(500).end(JSON.stringify({ error: "ServerError", message: error }));
    });
  }
});

// 
// PUT /accounts/multi/:token
// Adds user account to some session.
// 
router.put('/:token', (req, res) => {
  let token = req.params.token;
  let body  = req.body;

  // Some checks..
  if (body.token == null) return res.status(400).end(JSON.stringify({ error: "WrongPayload" }));

  helpers.getToken(token)
  .then((response) => {
    if (response.data.type == "session") {
      let object = response.data;
      // Let's check that token...
      helpers.getToken(req.body.token)
      .then((response) => {
        if (response.data.type == "user") {
          // update...
          let profiles = object.profiles;
          if (!profiles.includes(body.token)) {
            profiles.push(body.token);
          }

          helpers.updateToken(token, object)
          .then((response) => {
            res.end(JSON.stringify(response)); //h3Bg0ZYiJmLg
          })
          .catch((error) => {
            res.status(500).end(JSON.stringify({ error: "ServerError", message: error }));
          })
        } else {
          res.status(400).end(JSON.stringify({ error: "WrongPayload" }));
        }
      })
      .catch((error) => {
        res.status(500).end(JSON.stringify({ error: "ServerError", message: error }))
      });
    } else {
      res.status(404).end(JSON.stringify({ error: "NotFound" }));
    }
  })
  .catch((error) => {
    res.status(500).end(JSON.stringify({ error: "ServerError", message: error }))
  });
});

// 
// GET /accounts/multi/:token
// Gets all profiles of certain session
// 
router.get('/:token', (req, res) => {
  let token = req.params.token;
  helpers.getToken(token)
  .then((response) => {
    let profiles = response.data.profiles;
 
    if (profiles.length > 0) {
      res.end(JSON.stringify({ current: response.data.current, profiles: profiles }));
    } else {
      res.status(404).end(JSON.stringify({ error: "NotFound" }));
    }
  })
  .catch((error) => {
    res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error: error }))
  })
  // let query = {
  //   $$findOne: true,
  //   $$storage: "sessions",

  //   token: token
  // };

  // axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
  // .then((response) => {
  //   let data = response.data;

  //   if (data.error == "404") {
  //     res.status(404).end({ error: "NotFound" })
  //   } else {
  //     // Session file found... Let's reply with some information
  //     // about this session.
  //     res.end(JSON.stringify({ profiles: data.profiles == null ? [] : data.profiles }));
  //   }
  // })
  // .catch((error) => {
  //   res.status(500).end({ error: "ServerError", message: error })
  // });
});

module.exports = router;