const router = require('express').Router();
const config = require('config');

const Joi    = require('@hapi/joi');
const axios  = require('axios');

const helpers = {
  createToken: require('../helpers/tokens/create'),
  getToken: require('../helpers/tokens/get')
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
    url: Joi.string().required()
  });

  const validation = schema.validate(body);
  if (validation.error != null) {
    res.status(400);
    res.end(JSON.stringify({ error: "WrongPayload" }));
  } else {
    axios.post(`${config.get('nodes.main.url')}/post/${config.get('nodes.main.key')}`,
    {
      $$storage: "callbacks",

      url: body.url,

      registrat: {
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
  }
});

router.get('/finish/:id/:token', (req, res) => {
  const id    = req.params.id;
  const token = req.params.token;

  // Find that callback
  axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"callbacks","_id":"${id}"}`)
  .then((response) => {
    let body = response.data;

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
              helpers.createToken({ uid: data.data.uid, type: "user", expires: Math.floor(new Date() / 1000) + 604800 })
              .then((data) => {
                res.end(JSON.stringify({ token: data.token }));
              }).catch((error) => {
                res.status(500);
                console.log(error);
                console.log("FIRST ERROR");
                res.end(JSON.stringify({ error: "ServerError" }));
              })

              // Delete callback...
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