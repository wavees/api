const router   = require('express').Router();
const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs');

const config   = require('config');
const randomizer = require('../../helpers/randomizer');

const helpers  = {
  login: require('../../helpers/user/login'),
  register: require('../../helpers/user/register'),

  createToken: require('../../helpers/tokens/create'),
  getToken: require('../../helpers/tokens/get'),
  updateToken: require('../../helpers/tokens/update'),
  
  setAvatar: require('../../helpers/user/avatar'),

  getStore: require('../../helpers/stores/get')
};

router.get('/validate/:email', (req, res) => {
  let email = req.params.email;
  
  // CHECK EMAIL
  axios.get(`https://emailverification.whoisxmlapi.com/api/v1?apiKey=${config.get('email.verifyKey')}&emailAddress=${email}`)
  .then((response) => {
    if (response.data.smtpCheck == "true") {
      console.log("VALID");
      res.end(JSON.stringify({ valid: true, error: null }));
    } else {
      console.log("INVALID");
      res.end(JSON.stringify({ valid: false, error: "invalidEmail" }));
    }
  }).catch((error) => {
    console.log(error);
    res.status(500).end(JSON.stringify({ error: "ServerError", message: error }))
  })
});

// check user
router.get('/check/:email', (req, res) => {
  axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"users","email":"${req.params.email}"}`)
  .then((response) => {
    let body = response.data;
    
    if (body.error == "404") {
      res.status(404);
      res.end(JSON.stringify({ exists: false, error: "NotFound" }));
    } else {
      res.end(JSON.stringify({ 
        exists: true, 
        avatar: body.avatar == null ? null : `${config.get('api.avatars')}/${body.avatar}`,
        username: body.username
      }));
    }
  }).catch(() => {
    res.status(500);
    res.end(JSON.stringify({ exists: false, error: "ServerError" }));
  });
});

// register
router.post('/register', (req, res) => {
  helpers.register(req.body)
  .then((data) => {
    res.end(JSON.stringify(data));
  })
  .catch((error) => {
    if (error == "InvalidKey") {
      res.status(500);
      res.end(JSON.stringify({ error: "ServerError" }))
    } else if (error == "Registered") {
      res.status(400)
      res.end(JSON.stringify({ error: "Registered" }));
    } else if (error == "ServerError" || error == "DatabaseError" || error == "DatabaseLoadError") {
      res.status(500)
      res.end(JSON.stringify({ error: error }));
    } else if (error == "WrongEmail" || error == "WrongPayload") {
      res.status(400)
      res.end(JSON.stringify({ error: error }));
    } else {
      res.status(500)
      res.end(JSON.stringify({ error: "ServerError" }));
    }
  });
});

// login
router.post('/login', (req, res) => {
  helpers.login(req.body)
  .then((data) => {
    res.end(JSON.stringify({ token: data }));
  })
  .catch((error) => {
    console.log(error);
    if (error == "UserNotFound") {
      res.status(404);
      res.end(JSON.stringify({ error: "UserNotFound" }));
    } else if (error == "InvalidPassword") {
      res.status(400);
      res.end(JSON.stringify({ error: "InvalidPassword" }))
    } else {
      res.status(500);
      res.end(JSON.stringify({ error: "ServerError" }));
    }
  })
});

module.exports = router;