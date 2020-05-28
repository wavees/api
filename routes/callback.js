const router = require('express').Router();
const config = require('config');

const Joi    = require('@hapi/joi');
const axios  = require('axios');

const psl    = require('psl');

const helpers = {
  createToken: require('../helpers/tokens/create'),
  getToken: require('../helpers/tokens/get'),

  createStore: require('../helpers/stores/create'),
  getStore: require('../helpers/stores/get'),

  getEntity: require('../helpers/entities/get')
};

router.get('/:id', (req, res) => {
  axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"callbacks","_id":"${req.params.id}"}`)
  .then((response) => {
    let body = response.data;

    if (body.error == "404") {
      res.status(404);
      res.end(JSON.stringify({ error: "NotFound" }));
    } else {
      res.end(JSON.stringify(body));
    }
  }).catch(() => {
    res.status(500);
    res.end(JSON.stringify({ error: "ServerError" }));
  })
});

router.post('/', (req, res) => {
  const body = req.body;

  const schema = Joi.object({
    token: Joi.string().required(),
    url: Joi.string().required()
  });

  const validation = schema.validate(body);
  if (validation.error != null) {
    res.status(400);
    res.end(JSON.stringify({ error: "WrongPayload" }));
  } else {
    // Let's find an application with this token...
    helpers.getToken(body.token)
    .then((response) => {
      let data = response.data;
      let id = data.id;

      if (id == null) {
        return res.status(400).end(JSON.stringify({ error: "InvalidToken" }));
      } else {
        // We found application id, so now let's
        // find that application.
        let query = {
          $$storage: "applications",
          $$findOne: true,

          _id: id
        };

        helpers.getEntity(query)
        .then((response) => {
          // Application found, so now let's
          // create callback itself.
          axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`,
          {
            $$storage: "callbacks",
      
            url: body.url,
      
            registrat: {
              id: id,

              time: new Date(),
              origin: req.get('host')
            }
          })
          .then((response) => {
            let body = response.data;
      
            if (body.error) {
              res.status(500);
              res.end(JSON.stringify({ error: body.error }));
            } else {
              res.end(JSON.stringify({ id: body.document._id, url: `${config.get('callback.url')}/${body.document._id}` }));
            }
          }).catch(() => {
            res.status(500);
            res.end(JSON.stringify({ error: "NodeError" }));
          });
        }).catch((error) => {
          return res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error: "ApplicationNotFound" }));
        });
      }
    }).catch((error) => {
      return res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error: "InvalidToken" }));
    });
  }
});

router.get('/finish/:id/:token', (req, res) => {
  const id    = req.params.id;
  const token = req.params.token;

  // Find that callback
  axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"callbacks","_id":"${id}"}`)
  .then((response) => {
    let body = response.data;
    let callback = body;

    if (body.error == "404") {
      res.status(404);
      res.end(JSON.stringify({ error: "CallbackNotFound" }));
    } else {
      // Find token..
      
      helpers.getToken(token)
      .then((data) => {
        if (data.data.type == "user") {    
          // Find that user...
          axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"users","_id":"${data.data.uid}"}`)
          .then((response) => {
            let body = response.data;

            if (body.error == "404") {
              res.status(404);
              res.end(JSON.stringify({ error: "UserNotFound" }));

              // Delete callback...
            } else {
              // Create user token...

              helpers.createToken({ 
                uid: data.data.uid, 
                type: "user", 
                expires: Math.floor(new Date() / 1000) + 604800,
                registrat: callback.registrat })
              .then((data) => {
                // Let's check for dislaimer
                let query = { 
                  type: "redirect",
                  registrat: {
                    url: callback.url.replace('http://','').replace('https://','').split(/[/?#]/)[0]
                  }
                };

                helpers.getStore(token, query)
                .then((response) => {
                  if (response.length <= 0) {
                    // Create new user store for that domain/subdomain...
                    query.time = new Date();
                    helpers.createStore(token, query)
                  }
                });

                res.send(JSON.stringify({ token: data.token }));
              }).catch((error) => {
                res.status(500);
                res.end(JSON.stringify({ error: "ServerError" }));
              })

              // Delete callback...
              let query = {
                $$storage: "callbacks",
                $$multi: false,

                _id: callback._id
              };
              axios.delete(`${config.get('nodes.main.url')}/delete/${config.get('nodes.main.key')}/${JSON.stringify(query)}`)
            }
          }).catch(() => {
            res.status(500);
            res.end(JSON.stringify({ error: "ServerError" }));
          });
        } else {
          res.status(400);
          res.end(JSON.stringify({ error: "TokenNotFound" }));
        }
      })
      .catch((error) => {
        if (error == "NotFound") {
          res.status(400)
          res.end(JSON.stringify({ error: "TokenNotFound" }));
        } else {
          res.status(500)
          res.end(JSON.stringify({ error: "ServerError" }));
        }
      })
    }
  }).catch(() => {
    res.status(500);
    res.end(JSON.stringify({ error: "ServerError" }));
  });
});

module.exports = router;