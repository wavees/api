const router  = require('express').Router();

const axios   = require('axios');
const config  = require('config');

const functions = {
  createAppToken: require('../_functions/applications/createToken'),

  uploadLogotype: require('../_functions/applications/uploadLogotype'),
  getApplication: require('../_functions/applications/getApplication')
};

// @route getApplication
// @method GET
// @function .../getApplication.js
router.get('/:appId', (req, res) => {
  // Let's prepare application id
  let appId = req.params.appId;

  // And now let's get application data
  // and send it back to user...
  functions.getApplication(appId)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  });
});

// @route createAppToken
// @method POST
// @function .../createToken.js
router.post('/:appId/token/:token', (req, res) => {
  // Let's get needed information about this
  // application (appId, user token)
  let appId = req.params.appId;
  let token = req.params.token;

  // And now let's run function, that'll return
  // needed information.
  functions.createAppToken(appId, token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  })
});

router.post('/:token/logotype', (req, res) => {
  // Let's prepare application's token and
  // logotype;
  let token = req.params.token;
  let logo  = req.files.logotype;

  // Firstly, let's check if this request
  // appears to be normal (?)
  if (logo == null) {
    return res.status(400).end(JSON.stringify({ error: "InvalidPayload" }));
  }

  // And now let's call function, that'll
  // upload our logotype.
  functions.uploadLogotype(token, logo)
  .then((response) => {
    res.end(JSON.stringify(response))
  }).catch((error) => {
    res.status(error.code == null ? 500 : error.code).end(JSON.stringify(error));
  });
});

module.exports = router;