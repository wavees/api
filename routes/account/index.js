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
  },
  user: {
    // 
    getApprovedApplications: require('../_functions/accounts/user/userApplications/getList'),
    checkApproveApplication: require('../_functions/accounts/user/userApplications/checkApplication'),
    deleteApprovedApplication: require('../_functions/accounts/user/userApplications/deleteApplication')
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

// @route getApprovedApplications
// @method GET
// @function .../

router.get('/:token/applications', (req, res) => {
  let token = req.params.token;

  // Let's call that function
  functions.user.getApprovedApplications(token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  });
});

// @route checkApprovedApplication
// @method GET
// @function .../

router.get('/:token/application/:appId', (req, res) => {
  // Let's define some needed variables
  let token = req.params.token;
  let appId = req.params.appId;

  // And now let's make a request...
  functions.user.checkApproveApplication(token, appId)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  })
});

// @route deleteApprovedApplication
// @method DELETE
// @function

router.delete('/:token/application/:appId', (req, res) => {
  // Let's prepare some variables...
  let token = req.params.token;
  let appId = req.params.appId;

  // And now we need to run function, that'll
  // delete this application.
  functions.user.deleteApprovedApplication(token, appId)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  });
});

module.exports = router;