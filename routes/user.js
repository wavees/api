const router   = require('express').Router();
const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs');

const config   = require('config');
const randomizer = require('../helpers/randomizer');

const helpers  = {
  login: require('../helpers/user/login'),
  register: require('../helpers/user/register'),

  createToken: require('../helpers/tokens/create'),
  getToken: require('../helpers/tokens/get'),
  updateToken: require('../helpers/tokens/update'),
  
  checkApplication: require('../applications/check.js'),
  setAvatar: require('../helpers/user/avatar'),

  getStore: require('../helpers/stores/get')
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
      res.end(JSON.stringify({ exists: true, avatar: body.avatar == null ? null : `${config.get('api.avatars')}/${body.avatar}`}));
    }
  }).catch(() => {
    res.status(500);
    res.end(JSON.stringify({ exists: false, error: "ServerError" }));
  });
});

// get user
router.get('/:token', (req, res) => {
  let token = req.params.token;
  let origin = req.get('origin') || req.get('host');
  origin.replace('http://','').replace('https://','').split(/[/?#]/)[0];

  console.log(origin);
  return res.end(JSON.stringify({ origin: origin }));

  helpers.getToken(token)
  .then((data) => {
    if (data.data.type == "user") {
      axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"users","_id":"${data.data.uid}"}`)
      .then((response) => {
        let user = response.data;
        user.pincode = null;
        
        // Let's check if user approved this application.
        let object = {
          _id: user._id, 
          email: user.email, 
          username: user.username, 
          avatar: user.avatar == null ? null : `${config.get('api.avatars')}/${user.avatar}`
        };

        if (origin == "account.wavees.co.vu" || origin == "api.wavees.co.vu") {
          if (user.email == null || user.username == null) {
            res.status(500);
            res.end(JSON.stringify({ error: "UserNotFound" }));
          } else {
            res.end(JSON.stringify(object));
          };
        } else {
          helpers.getStore(token, { type: "redirect", registrat: { url: origin } })
          .then((response) => {
            if (response.length <= 0) {
              res.status(400).end(JSON.stringify({ error: "UnapprovedApplication", origin: origin }));
            } else {
              if (user.email == null || user.username == null) {
                res.status(500);
                res.end(JSON.stringify({ error: "UserNotFound" }));
              } else {
                res.end(JSON.stringify(object));
              };
            }
          }).catch((error) => {
            res.status(400).end(JSON.stringify({ error: "UnapprovedApplication", origin: origin }));
          });
        };
      })
      .catch(() => {
        res.status(500);
        res.end(JSON.stringify({ error: "ServerError" }));
      });
    } else {
      res.status(400);
      res.end(JSON.stringify({ error: "InvalidToken" }));
    }
  })
  .catch(() => {
    res.status(400);
    res.end(JSON.stringify({ error: "InvalidToken" }));
  });
});

router.post('/:token/avatar', (req, res) => {
  let token = req.params.token;
  
  // Check for files
  if (!req.files) {
    return res.status(400).end(JSON.stringify({ error: "InvalidPayload" }));
  };

  // Check for user token.
  helpers.getToken(token)
  .then((response) => {
    let data = response.data;

    if (data.type == "user") {
      let avatar = req.files.avatar;
      let tempPath = `./temporary/${randomizer(12)}.${avatar.name.split('.')[1]}`;

      if (avatar) {
        avatar.mv(tempPath, (error) => {
          if (error) {
            console.log('error 5');
            console.log(error);
            res.status(500).end(JSON.stringify({ error: "ServerError" }));
          } else {
            let formData = new FormData();
            formData.append("image", fs.createReadStream(tempPath), avatar.name);
    
            axios.post(`${config.get('nodes.main.url')}/files/post/${config.get('nodes.main.key')}`, formData, 
            { 
              headers: formData.getHeaders() 
            })
            .then((response) => {
              let avatarURL = response.data.token;

              // Let's update user account...
              axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"users","_id":"${data.uid}"}`)
              .then((response) => {
                let user = response.data;
                user.avatar = avatarURL;

                axios.put(`${config.get('nodes.main.url')}/update/${config.get('nodes.main.key')}/{"$$storage":"users","_id":"${data.uid}"}`, user)
                .then((response) => {
                  let data = response.data;

                  console.log(data);
                  res.end(JSON.stringify(data));
                }).catch((error) => {
                  console.log('erro 56');
                  console.log(error);

                  res.status(500).end(JSON.stringify({ error: "ServerError" }));
                })
              }).catch((error) => {
                console.log('erro 4');
                console.log(error);
                res.status(500).end(JSON.stringify({ error: "ServerError" }));
              })
            }).catch((error) => {
              console.log('error 1');
              console.log(error);
              res.status(500).end(JSON.stringify({ error: "ServerError" }));
            });
          }
        });
      }
    } else {
      res.status(400).end(JSON.stringify({ error: "InvalidPayload" }));
    };
  }).catch((error) => {
    console.log('error 3');
    console.log(error);
    res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error }));
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