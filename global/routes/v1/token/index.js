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
    let permissions = config.get('permissions.default');
    if (response.permissions == null) {
      permissions = helpers.permissions(permissions);
    } else {
      permissions = helpers.permissions(permissions.push(response.permissions));
    };

    res.end(JSON.stringify(permissions.list()));
  }).catch((error) => {
    console.log(error);
    res.status(error == "NotFound" ? 404 : 500).end(JSON.stringify({ status: error == "NotFound" ? 404 : 500, error: error }));
  });
});

module.exports = router;