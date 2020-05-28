const router  = require('express').Router();
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

// POST
// Get (create) new application
// token.
router.post('/:slug/token', (req, res) => {
  let slug = req.params.slug;
  let body = req.body;

  let token = body.token;
  if (token == null) return res.status(400).end(JSON.stringify({ error: "InvalidToken" }));

  // Let's find application with this slug.
  let query = {
    $$storage: "applications",
    $$findOne: true,

    slug: slug
  };

  helpers.get(query)
  .then((response) => {
    let data = response;
    let members = data.members;

    let id = response._id;

    // Now let's check user token...
    helpers.getToken(token)
    .then((response) => {
      let uid = response.data.uid;
      let user = {};

      members.forEach((member) => {
        if (member.uid == uid) {
          user = member;
          return;
        }
      });

      // Let's check if user with this token
      // can create application token
      // (As for now only owners can create tokens)
      if (user.role == "owner") {
        // So, we found this application and checked for
        // user token. And now we need to create application token.
        let entity = {
          id: id,
          permissions: "*"
        };

        helpers.createToken(entity)
        .then((response) => {
          let token = response.token;

          res.end(JSON.stringify({ token }));
        }).catch((error) => {
          return res.status(error == "" ? 404 : 500).end(JSON.stringify({ error }));
        });
      } else {
        return res.status(400).end(JSON.stringify({ error: "InsufficientPermission" }));
      };
    }).catch((error) => {
      return res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error: "InvalidToken" }));
    });
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

      helpers.get(query)
      .then((response) => {
        res.end(JSON.stringify(response));
      }).catch((error) => {
        res.end(JSON.stringify([]));
      })
    } else {
      return res.status(400).end(JSON.stringify({ error: "InvalidToken" }));
    };
  }).catch((error) => {
    return res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error: "InvalidToken" }));
  })
});

module.exports = router;