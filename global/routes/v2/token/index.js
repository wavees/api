const router   = require('express').Router();
const cache    = require('apicache').middleware;

const actions = {
  retrieveToken: require('../../../actions/tokens/retrieveToken'),

  getPermissions: require('../../../actions/tokens/permissions/getPermissions'),
  checkPermission: require('../../../actions/tokens/permissions/checkPermission')
};

// Retrieve token
router.get('/:token', cache('1 day'), (req, res) => {
  const token = req.params.token;
  req.apicacheGroup = `token/${token}`;

  actions.retrieveToken(token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Get Permissions
router.get('/:token/permissions', cache('7 days'), (req, res) => {
  const token = req.params.token;
  req.apicacheGroup = "permissions";

  actions.getPermissions(token)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

// Check Permission
router.get('/:token/permission/:permission', cache('7 days'), (req, res) => {
  const token      = req.params.token;
  const permission = req.params.permission;
  req.apicacheGroup = "permissions";

  actions.checkPermission(token, permission)
  .then((response) => {
    res.end(JSON.stringify(response));
  }).catch((error) => {
    res.status(error.status == null ? 500 : error.status).end(JSON.stringify(error));
  });
});

module.exports = router;