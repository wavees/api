const router  = require('express').Router();
const axios = require('axios');
const config  = require('config');

const Joi     = require('@hapi/joi');

const helpers = {
  getToken: require('../helpers/tokens/get'),
  createToken: require('../helpers/tokens/create'),

  get: require('../helpers/entities/get'),
  create: require('../helpers/entities/create'),

  randomizer: require('../helpers/randomizer')
};

// POST
// Create application
router.post('/', (req, res) => {
  let body = req.body;

  const schema = Joi.object({
    token: Joi.string().required(),
    name: Joi.string().required()
  });

  const validation = schema.validate(body);
  // Let's check if there are any errors
  // in validation process
  if (validation.error != null) return res.status(400).end(JSON.stringify({ error: "InvalidPayload", validation: validation.error }));

  // So now let's check if it's an user token.
  helpers.getToken(body.token)
  .then((response) => {
    let data = response.data;

    // It's an user token, so let's continue with
    // application creation...
    if (data.type == "user") {
      // Here we'll create this application and then
      // we'll send response to request.
      let entity = {
        $$storage: "applications",

        members: [
          { 
            uid: data.uid,
            role: "owner"
          }
        ],

        name: body.name,
        slug: helpers.randomizer(6)
      };

      helpers.create(entity)
      .then((response) => {
        res.end(JSON.stringify(response));
      }).catch((error) => {
        return res.status(500).end(JSON.stringify({ error: "ServerError" }));
      });
    } else {
      // Make something with this (with session tokens)
      return res.status(400).end(JSON.stringify({ error: "InvalidToken" }));
    }
  }).catch((error) => {
    return res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error }));
  });
});

// GET
// Get list of all user's applications
router.get('/:token/list', (req, res) => {
  let token = req.params.token;

  // Let's check user token first.
  helpers.getToken(token)
  .then((response) => {
    let data = response.data;

    if (data.type == "user") {
      // So, we found user token and now we need
      // to find list of user's application
      let query = {
        $$storage: "applications",
        $$findOne: false,

        members: { $in: [ { uid: data.uid, role: "owner" } ] }
      };

      axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
      .then((response) => {
        let data = response.data;

        if (data.error != "404") {
          res.end(JSON.stringify(data));
        } else {
          res.end(JSON.stringify([]));
        }
      }).catch((error) => {
        res.end(JSON.stringify([]));
      });
      // helpers.get(query)
      // .then((response) => {
      //   res.end(JSON.stringify(response));
      // }).catch((error) => {
      //   res.end(JSON.stringify([]));
      // })
    } else {
      return res.status(400).end(JSON.stringify({ error: "InvalidToken" }));
    };
  }).catch((error) => {
    return res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error: "InvalidToken" }));
  })
});

module.exports = router;