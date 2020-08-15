const router  = require('express').Router();

const axios   = require('axios');
const config  = require('config');

// Helpers object
const helpers = {
  getToken: require("../../../helpers/tokens/get.js"),
  permissions: require('../../../helpers/permissions/index')
};

// Functions object
const functions = {
  duplicateToken: require('../../_functions/tokens/duplicateToken.js')
};

// @route getTokenPermissions
// @method GET
router.get('/:token/permissions', (req, res) => {
  // Let's prepare our token
  let token = req.params.token;

  // And now let's just get this token.
  helpers.getToken(token)
  .then((response) => {
    // Let's now create our default permissions
    // object and just return it.
    let data = response.data;

    let permissions = config.get('permissions.default');
    if (data.permissions == null) {
      permissions = helpers.permissions(...permissions);
    } else {
      permissions = helpers.permissions(...permissions, ...data.permissions);
    };

    res.end(JSON.stringify(permissions.list()));
  }).catch((error) => {
    console.log(error);
    res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ status: error == "NotFound" ? 404 : 500, error: error }));
  });
});

// @route DuplicateToken
router.post('/:token/duplicate', (req, res) => {
  // Let's now get our token and
  // new permissions object.
  let token = req.params.token;
  let body  = req.body;

  // Let's just duplicate this token.
  functions.duplicateToken(token, body)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;