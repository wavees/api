// @section import 
// Here we'll import all needed modules and
// components.

// Express router
const router    = require('express').Router();


// @section Importing function
// And now we need to import all
// functions, that'll power this
// route
const functions = {
  sessions: {
    createSession: require('../_functions/accounts/sessions/createSession'),
    removeProfile: require('../_functions/accounts/sessions/removeProfile'),
    getProfiles: require('../_functions/accounts/sessions/getProfiles'),
    addProfile: require('../_functions/accounts/sessions/addProfile'),
  }
};


// @section sessions routes
// Here will be all session-related
// routes.


// @route createSession
// @method POST
// @function .../createSession.js

router.post('/', (req, res) => {
  let body = req.body;

  // We need to call createSession function
  // and than send a response.
  functions.sessions.createSession(body)
  .then((response) => {
    // Let's end this request with
    // some tasty response
    res.end(JSON.stringify(response));
  })
  .catch((error) => {
    // Oh no, an error!
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  });
});

// @route getProfiles
// @method GET
// @function .../getProfiles.js

router.get('/:token', (req, res) => {
  let token = req.params.token;

  // And we now we need to call getProfiles function...
  functions.sessions.getProfiles(token)
  .then((response) => {
    // Let's send response.
    res.end(JSON.stringify(response));
  })
  .catch((error) => {
    // Send error message back.
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  });
});

// @route addProfile
// @method PUT
// @function .../addProfile

router.put('/:session/:token', (req, res) => {
  let sessionToken = req.params.session;
  let token = req.params.token;

  // And again-again
  functions.sessions.addProfile(sessionToken, token)
  .then((response) => {
    // Nasty response
    res.end(JSON.stringify(response));
  })
  .catch((error) => {
    // Error, oh yeah
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  });
});

// @route removeProfile
// @method DELETE
// @function .../removeProfile.js

router.delete('/:session/:token', (req, res) => {
  let sessionToken = req.params.session;
  let token = req.params.token;

  // Function calling
  functions.sessions.removeProfile(sessionToken, token)
  .then((response) => {
    res.end(JSON.stringify(response));
  })
  .catch((error) => {
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  });
});

// // 
// // 
// // 
// // 
// // 
// // 
// // 
// // 
// // 
// // 
// router.get('/:token/application/:id', (req, res) => {
//   let token  = req.params.token;
//   let id = req.params.id;

//   helpers.getToken(token)
//   .then((data) => {
//     if (data.data.type == "user") {
//       // Let's get that registrat...
//       let query = {
//         $$findOne: true,

//         type: "redirect",
//         appId: id
//       };
//       helpers.getStore(token, query)
//       .then((response) => {
//         let data = response;

//         if (data.error == "404") {
//           res.end(JSON.stringify({}));
//         } else {
//           let response = {
//             agreed: true,

//             registrat: data.registrat
//           };

//           res.end(JSON.stringify(response));
//         }
//       }).catch((error) => {
//         res.status(error == "InvalidToken" ? 400 : 500).end(JSON.stringify({ error: error }));
//       });
//     } else {
//       res.status(400).end(JSON.stringify({ error: "InvalidToken" }));
//     }
//   }).catch((error) => {
//     console.log(error);
//     res.status(500).end(JSON.stringify({ error: "ServerError", message: error }));
//   })
// });

// router.get('/:token/applications', (req, res) => {
//   let token = req.params.token;

//   helpers.getToken(token)
//   .then((response) => {
//     let data = response.data;

//     if (data.type == "user") {
//       let query = {
//         type: "redirect"
//       };

//       helpers.getStore(token, query)
//       .then((response) => {
//         let applications = [];
//         response.forEach((obj) => {
//           if (obj.appId != null) {
//             applications.push(obj);
//           }
//         });

//         res.end(JSON.stringify(applications));
//       }).catch((error) => {
//         res.status(error == "InvalidToken" ? 400 : 500).end(JSON.stringify({ error }));
//       })
//     } else {
//       res.status(404).end(JSON.stringify({ error: "NotFound" }));
//     }
//   }).catch((error) => {
//     res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error }));
//   })
// });

// router.delete('/:token/application/:id', (req, res) => {
//   let token = req.params.token;
//   let id = req.params.id;
  
//   helpers.getToken(token)
//   .then((response) => {
//     let data = response.data;

//     if (data.type == "user") {
//       // Let's delete this store.
//       let query = {
//         appId: id
//       };
//       helpers.deleteStore(token, query)
//       .then((response) => {
//         res.end(JSON.stringify(response));
//       }).catch((error) => {
//         res.status(500).end(JSON.stringify({ error: "ServerError" }));
//       })
//     } else {
//       res.status(400).end(JSON.stringify({ error: "InvalidToken" }));
//     }
//   }).catch((error) => {
//     res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ error }));
//   });
// });

module.exports = router;