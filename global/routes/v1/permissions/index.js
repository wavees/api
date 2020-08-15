const router  = require('express').Router();

const axios   = require('axios');
const config  = require('config');

// @route getPermissions
// @method GET
router.get('/:permissions', (req, res) => {
  // Let's now prepare our permissions array.
  let permissions       = req.params.permissions.split(',');
  let returnPermissions = [];

  // And now let's loop all our
  // permissions and get their configurations
  // and information.
  permissions.forEach(perm => {
    let permission = config.get(`permissions.list.${perm}`);

    if (permission != null) {
      permission.permission = perm; 

      returnPermissions.push(permission);
    };
  });

  res.end(JSON.stringify(returnPermissions));
});

module.exports = router;