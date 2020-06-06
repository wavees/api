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

  getEntity: require('../helpers/entities/get'),
  getApplication: require('./_functions/applications/getApplication')
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
    token: Joi.string().optional(),
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
        // Let's create callbackData object
        // This object contains all callback data
        // that are needed to create callback. 
        let callbackData = {
          url: body.url,

          registrat: {
            id: null,
            origin: req.get('host')
          }
        };

        // We found application id, so now let's
        // find that application.
        
        helpers.getApplication(id)
        .then((response) => {
          // Application found, so now let's
          // create callback itself.
          callbackData.registrat.id = response.id;

          createCallback(callbackData)
          .then((response) => {
            res.end(JSON.stringify(response));
          }).catch(() => {
            return res.status(500).end(JSON.stringify({ error: "ServerError" }));
          })
        }).catch(() => {
          return res.status(404).end(JSON.stringify({ error: "ApplicationNotFound" }));
        });
      }
    }).catch((error) => {
      console.log(error);
      return res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error: "InvalidToken" }));
    });
  }
});

function createCallback(data) {
  let url = data.url;
  let registrat = data.registrat;

  return new Promise((resolve, reject) => {
    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`,
    {
      $$storage: "callbacks",

      url: url,

      registrat: {
        id: registrat.id,

        time: new Date(),
        origin: registrat.host
      }
    })
    .then((response) => {
      let body = response.data;

      if (body.error) {
        reject("ServerError");
      } else {
        console.log("NEW CALLBACK:");
        console.log(body);
        resolve({ id: body.document._id, url: `${config.get('callback.url')}/${body.document._id}` });
      }
    }).catch(() => {
      reject("ServerError");
    });
  })
};

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
                  type: "approvedApplication",
                  appId: callback.registrat.id
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