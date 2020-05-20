const router = require('express').Router();
const axios  = require('axios');

const config = require('config');

const helpers = {
  login: require('../helpers/user/login'),
  register: require('../helpers/user/register'),

  createToken: require('../helpers/tokens/create'),
  getToken: require('../helpers/tokens/get'),
  
  checkApplication: require('../applications/check.js')
};

// 
// application storage
// 

// router.get('/store/:token/:application', (req, res) => {
//   let token = req.params.token;
//   let application = helpers.checkApplication(req.params.application);

//   if (application.error == "NotFound") {
//     res.status(404);
//     res.end(JSON.stringify({ error: "ApplicationNotFound" }));
//   } else {
//     // User check
//     helpers.getToken(req.params.token)
//     .then((data) => {
//       if (data.data.type == "user") {
//         axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"users","_id":"${data.data.uid}"}`)
//         .then((response) => {
//           let user = response.data;
//           user.pincode = null;

//           if (user.email == null || user.username == null) {
//             res.status(500);
//             res.end(JSON.stringify({ error: "UserNotFound" }));
//           } else {
//             // user found, okay. Now let's check this
//             // application storage in user's account.
//           }
//         })
//         .catch(() => {
//           res.status(500);
//           res.end(JSON.stringify({ error: "ServerError" }));
//         });
//       } else {
//         res.status(400);
//         res.end(JSON.stringify({ error: "InvalidToken" }));
//       }
//     })
//     .catch(() => {
//       res.status(400);
//       res.end(JSON.stringify({ error: "InvalidToken" }));
//     });
//   }
// });

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
      res.end(JSON.stringify({ exists: true, avatar: body.avatar == null ? "https://cdn.dribbble.com/users/45488/screenshots/9084073/media/f889543c2e901048f8da2d9915d0bf37.jpg" : body.avatar}));
    }
  }).catch(() => {
    res.status(500);
    res.end(JSON.stringify({ exists: false, error: "ServerError" }));
  });
});

// get user
router.get('/:token', (req, res) => {
  helpers.getToken(req.params.token)
  .then((data) => {
    if (data.data.type == "user") {
      axios.get(`${config.get('nodes.main.url')}/get/${config.get('nodes.main.key')}/{"$$findOne":true,"$$storage":"users","_id":"${data.data.uid}"}`)
      .then((response) => {
        let user = response.data;
        user.pincode = null;
        
        if (user.email == null || user.username == null) {
          res.status(500);
          res.end(JSON.stringify({ error: "UserNotFound" }));
        } else {
          res.end(JSON.stringify({ 
            _id: user._id, 
            email: user.email, 
            username: user.username, 
            avatar: user.avatar || "https://cdn.dribbble.com/users/45488/screenshots/9084073/media/f889543c2e901048f8da2d9915d0bf37.jpg"
          }));
        }
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